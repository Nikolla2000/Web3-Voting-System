# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Four independent projects, not a unified monorepo tool (no root package.json):

- `backend/` — NestJS monorepo (5 working services + 1 dead scaffold (`auth`, see below) + 1 shared lib), managed by `nest-cli.json`
- `frontend/` — Next.js 16 / React 19 app
- `contracts/` — Hardhat project for the on-chain Semaphore voting contract (`PollVoting.sol`)
- `ai-service/` — Python (uv) microservice for AI/ML features, proxied through the gateway like every other service

## Project purpose & vision

Web3 decentralized voting system is a portfolio project — explicit goal is to demonstrate breadth of
architectural knowledge to future employers. Protocol diversity (TCP, gRPC,
RabbitMQ pub/sub) is intentional for that reason, not because each is
strictly the optimal choice for its use case. Don't "simplify" this
toward one uniform protocol.

## Key decisions

- Gateway is the single JWT authority; downstream services trust the
  `userId` forwarded in the payload. Only the gateway wraps responses
  in the standard envelope.
- Raw `amqplib` (not Nest's `Transport.RMQ`) — this is pub/sub with
  multiple independent consumers, not RPC.
- Voter anonymity is implemented via Semaphore ZK proofs (the `blockchain`
  service) — `walletAddress` was removed from the User model and the
  wagmi/RainbowKit wallet-connect UI was removed from the frontend entirely.
  Voting identities are random keypairs generated client-side
  (`frontend/src/lib/voting/identity.ts`), unrelated to the platform account
  or any wallet. **Don't reintroduce wallet-connect UI** — nothing about
  voting or account identity depends on a wallet, and re-adding one would
  misleadingly imply it's needed.
- Every on-chain transaction (poll creation, group membership, vote casting)
  is signed by one relayer account (`RELAYER_PRIVATE_KEY`, `apps/blockchain/.env`),
  never the voter's own key — anonymity depends on every vote sharing one
  sender address regardless of which identity generated the proof. That same
  address must be `PollVoting.sol`'s on-chain owner.
- NextAuth was evaluated and explicitly rejected in favor of the
  custom JWT implementation — don't suggest switching back.
- Access token: zustand in-memory only, never localStorage/cookies.
- Refresh token as an http-only cookie

## Conventions

- Frontend: always componentized, never a monolithic JSX blob — every
  UI element is its own file.
- Frontend Design: Follow the clean light/blue/purple color theme of the website. The design should feel modern and futuristic, yet professional and minimal.
- UI & Code Style: Avoid the typical "AI-generated" look. Do not spam icons or emojis everywhere. Use icons sparingly and only where they add genuine functional value, keeping the layout clean and human-designed.
- Reusable backend logic goes in `libs/shared/`, never duplicated
  per-service.
- Constants (routing keys, exchange names, etc.) live in one
  single-source-of-truth object, never scattered.

## Backend (`backend/`)

### Commands

Run from `backend/`. This is a Nest **monorepo** — most CLI commands take a project name (see `nest-cli.json` for the list: `api-gateway`, `auth`, `blockchain`, `identity`, `notifications`, `polls`, `shared`). `api-gateway` is the default project.

```bash
npm run start:dev              # api-gateway (default project), watch mode
nest start identity --watch    # any other app: substitute the project name
nest build polls               # build a specific app

npm run lint                   # eslint --fix across apps/libs
npm run format                 # prettier --write

npm test                       # jest, all *.spec.ts under apps/ and libs/
npx jest path/to/file.spec.ts  # single test file
npm run test:watch
npm run test:cov
npm run test:e2e               # note: script's --config path is stale (apps/backend/...); run e2e per-app instead, e.g.:
npx jest --config apps/identity/test/jest-e2e.json
```

Each service loads its own `.env` (backend/.env for api-gateway; `apps/identity/.env`, `apps/polls/.env`, `apps/blockchain/.env`, `apps/notifications/.env` for the others). `identity`, `polls` and `blockchain` each have their own Prisma schema/DB — after editing any of them, regenerate from that app's directory context (schema paths: `apps/identity/prisma/schema.prisma`, `apps/polls/prisma/schema.prisma`, `apps/blockchain/prisma/schema.prisma`; generated clients land in each app's `src/generated/prisma`, gitignored). `backend/.env` (api-gateway) and `apps/polls/.env` additionally need `REDIS_URL` — the only two services that use Redis.

Path alias: `@app/shared` / `@app/shared/*` → `libs/shared/src` (set in root `tsconfig.json`, mirrored in Jest's `moduleNameMapper`).

### Architecture

This is a microservices voting platform. The API gateway is the only HTTP-facing service; everything else speaks internal protocols:

| App | Role | Transport | Port |
|---|---|---|---|
| `api-gateway` | Public REST API, Swagger docs, JWT auth guard, request validation | HTTP | 3000 |
| `identity` | Users, registration/login, JWT issuance, Google OAuth, refresh tokens (own Postgres via Prisma) | TCP microservice | 3001 |
| `polls` | Poll CRUD, vote tallying (own Postgres via Prisma) | gRPC (`libs/shared/src/polls/polls.proto`) | 3002 |
| `blockchain` | Semaphore ZK group membership + the relayer that signs every on-chain tx against the deployed `PollVoting` contract (own Postgres via Prisma, `GroupMember`) | gRPC (`libs/shared/src/blockchain/blockchain.proto`) | 3003 |
| `notifications` | Welcome emails, etc. | No inbound transport — `NestFactory.createApplicationContext`, driven by RabbitMQ consumers only |
| `auth` | **Unused scaffold** left over from `nest generate app` — not wired into the real auth flow. Real auth lives in `identity/src/auth` (service logic) and `api-gateway/src/auth` (gateway-side proxy/guards). Don't confuse the two. |

`api-gateway` proxies requests rather than implementing business logic itself:
- `api-gateway/src/auth/auth-proxy.controller.ts` — HTTP endpoints that forward to `identity` over a TCP `ClientProxy` using message patterns from `AUTH_PATTERNS`/`USERS_PATTERNS` (`libs/shared/src/auth/auth.patterns.ts`, `.../users/users.patterns.ts`). `auth-proxy.service.ts` is dead code (fully commented out) — the controller talks to the client directly instead. Also hosts the `users/me` routes (profile, password change, avatar upload, account deactivation) alongside the auth ones.
- `api-gateway/src/polls/polls-proxy.controller.ts` — forwards to `polls` over gRPC (`ClientGrpc`, service name `PollsService`). Also hosts `POST /polls/images` (poll cover image upload — see **File storage (R2)** below), which doesn't touch the gRPC client at all.
- `api-gateway/src/blockchain/blockchain-proxy.controller.ts` — forwards to `blockchain` over gRPC (`ClientGrpc`, service name `BlockchainService`) under `/polls/:id/group/join`, `/polls/:id/group/merkle-proof`, `/polls/:id/vote/verify`, `/polls/:id/vote`.
- Refresh tokens are set as an httpOnly cookie by the gateway; access tokens are short-lived JWTs (15m) returned in the response body and attached client-side as a Bearer header.
- Google OAuth: `GET /auth/google` and `/auth/google/callback` (gateway-side `GoogleStrategy`/`GoogleOAuthGuard`, `api-gateway/src/auth/`) handle the browser redirect/consent round trip — this has to live in the gateway, not `identity`, since `identity` is TCP-only and has no HTTP listener for Google to redirect back to. The callback forwards the Google profile to `identity` over the existing TCP client (`AUTH_PATTERNS.GOOGLE_AUTH` → `AuthService.googleAuth()`, find-or-create by email), sets the refresh cookie exactly like `login()` does, then redirects to the frontend root rather than putting a token in the URL — `AuthBootstrap` (mounted in the root layout) hydrates the session from that cookie like any other page load, so no dedicated callback page is needed. `GoogleProfile` (`@app/shared`) is the shared shape crossing that TCP boundary.

**Shared lib** (`libs/shared`, imported as `@app/shared`): message pattern constants, DTOs, RabbitMQ wrapper services (`RabbitMQConnectionService`/`Publisher`/`Consumer`, exchange `voting_system`), RPC exception helpers, the R2 storage service (see below). Routing keys live in one place, `rabbitmq.constants.ts` (`ROUTING_KEYS`): `USER_REGISTERED`, `VOTE_CAST` (`'polls.vote_cast'`), `POLL_CREATED`, `POLL_CONTRACT_DEPLOYED`.

**Poll lifecycle, on-chain**: `polls` publishes `POLL_CREATED` when a poll is created. `blockchain/src/events/poll-created.consumer.ts` consumes it and deploys that poll's Semaphore group on the single shared `PollVoting` contract (`ContractService.createPoll`), then publishes `POLL_CONTRACT_DEPLOYED`; `polls/src/events/poll-contract-deployed.consumer.ts` writes the resulting `contractAddress` onto the `Poll` row — `polls` owns that column, `blockchain` never persists its own copy.

**Vote flow**: the frontend generates a Semaphore proof client-side (see Frontend notes below) and submits it through `blockchain-proxy.controller.ts` → `blockchain`'s `SubmitVote` gRPC method, which verifies the proof (`SemaphoreService.verifyProof`) and relays `castVote` on-chain (`ContractService.castVote`). `blockchain/src/events/chain-listener.service.ts` — the blockchain-indexer the old roadmap described as "not yet built," implemented here rather than as a separate app — watches the contract's `VoteCast` log and republishes it as `ROUTING_KEYS.VOTE_CAST`. `polls/src/events/vote-sync.consumer.ts` consumes that, incrementing cached `Poll.totalVotes`/`PollOption.votes` in Postgres inside a transaction. It's idempotent against at-least-once redelivery via a `ProcessedVote` unique constraint on `(pollId, nullifierHash)` — duplicate deliveries are caught via Prisma's `P2002` and swallowed.

**Blockchain service internals**: `SemaphoreService` owns group membership — the Merkle tree (`@semaphore-protocol/group`) only lives in memory, rebuilt on demand from `GroupMember` rows and cached per `pollId`, so a restart never loses membership or invalidates issued Merkle proofs. `GroupMember` is the Sybil-resistance gate (one commitment per `(pollId, userId)`, enforced in `joinGroup`) and the one place a platform account links to an anonymous commitment — that link is never published anywhere (not to `polls`, not on-chain, not through any API). `uuidToFieldElement`/`fieldElementToUuid` (`libs/shared/src/blockchain/identifier.util.ts`) convert poll/option UUIDs to/from the field elements Semaphore's `scope`/`message` need — the frontend must derive them the exact same way or proof verification fails.

**File storage (R2)**: Cloudflare R2 (S3-compatible), via a shared `R2StorageService` (`libs/shared/src/storage/r2-storage.service.ts`) and shared size/type constants (`image-upload.constants.ts`, 5MB, jpg/png/webp). Each service that uploads has its **own bucket and its own scoped R2 API token** (least-privilege — one service's credentials can't touch another's bucket), configured via that service's own `.env` (`R2_BUCKET_NAME`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_ENDPOINT`/`R2_PUBLIC_URL`). Two different upload patterns are used deliberately, each justified by the entity's lifecycle rather than picked arbitrarily:
- **Avatars** (`identity`): presigned direct-to-browser upload. The user row already exists, so `identity` mints a short-lived presigned PUT URL, the browser uploads straight to R2, then a confirm step (`PATCH /users/me/avatar`) verifies the key belongs to that user and that the object actually exists before saving it and deleting the previous avatar object.
- **Poll cover images** (`api-gateway`): server-mediated upload (`POST /polls/images`, multipart via `FileInterceptor`). A poll doesn't exist yet while its create form is open, so there's no entity to scope an eager direct-to-bucket upload to; uploading through the gateway at submit time means nothing lands in R2 until the poll is actually being created. No CORS setup needed on this bucket, unlike the avatars one — the browser only ever talks to the gateway here, never to R2 directly.

**Caching & rate limiting (Redis)**: a single Upstash Redis instance (hosted free tier, same precedent as CloudAMQP/R2 — no self-run infra), via a shared `RedisService` (`libs/shared/src/redis/redis.service.ts`, a thin ioredis connection wrapper) and a per-app `RedisModule` in each of the two services that actually use it — `api-gateway` and `polls` only. Deliberately not `blockchain`: `SemaphoreService`'s in-memory Merkle tree (see below) is a live data structure Semaphore's own API operates on directly, not a flat cacheable value — moving it to Redis would mean deserializing it back into a `Group` before every operation for no gain, plus a second source of truth alongside `GroupMember` for something correctness-sensitive enough that staleness would silently break voting. Also not `identity`: its own `JwtStrategy`'s per-request DB lookup is dead scaffold code never wired into `IdentityModule`, not an active hot path. Three independent pieces:
- **Poll detail cache-aside** (`polls.service.ts`'s `findById`): 60s TTL as a safety net, explicitly invalidated by the two consumers that mutate a cached poll's fields (`vote-sync.consumer.ts` on vote tallies, `poll-contract-deployed.consumer.ts` on `contractAddress`). Targets the poll detail page's 15s active-poll refetch (`frontend/src/app/polls/[id]/page.tsx`), which multiplies by however many people are viewing that poll concurrently.
- **Poll listing cache-aside** (`findMany`): the listing's key space (search/status/sortBy/page/limit) is combinatorial, so a single write can't target one specific cached entry the way poll-detail invalidation does. Instead every cache key embeds a version number (`polls-cache.constants.ts`); poll creation, vote tallies, and contract deployment all just increment it, orphaning every previously-cached listing at once in O(1) rather than scanning for and deleting each one. Orphaned entries fall out via a 30s TTL.
- **Gateway rate limiting** (`ThrottlerModule`, `api-gateway.module.ts`): was configured from the start but never actually enforced — no guard was ever registered, so it did nothing until now. `ThrottlerGuard` is registered as `APP_GUARD`, backed by a custom `RedisThrottlerStorage` (`api-gateway/src/throttler/redis-throttler-storage.ts`, a Lua-scripted `ThrottlerStorage` implementation) instead of the library's default in-memory Map, so counters survive a restart and would be shared across instances. Limits are differentiated per endpoint by threat model rather than one global number: strict on `auth/register`/`login`/`refresh` (the actual brute-force/credential-stuffing surface), moderate on anything that costs the relayer real (testnet) gas or could be spammed (poll creation, poll image upload, group join, vote submission), and poll listing/detail are exempt via `@SkipThrottle()` since they're already behind the cache-aside layer above — throttling them at the gateway too would fight that caching rather than complement it. `Retry-After` is explicitly CORS-exposed (`main.ts`'s `enableCors`) since rate-limit headers aren't on the CORS-safelisted list by default; the frontend's `getApiErrorMessage` (`frontend/src/lib/api/errors.ts`) turns a 429 into a "try again in Ns" message.

## AI service (`ai-service/`)

Python (uv, Python 3.12) — not part of the Nest monorepo, a sibling top-level project proxied through `api-gateway`'s `AiModule`/`AiProxyController` like every other service. Own `.env`, own local Postgres (Docker, `ai_service_db_container`, port 5435, `pgvector/pgvector:pg16`) — the self-run-per-service pattern identity/polls/blockchain use, not the hosted-free-tier pattern Redis/RabbitMQ/R2 use, since pgvector needs the extension.

### Commands

Run from `ai-service/`:

```bash
uv run python -m ai_service.main    # RabbitMQ consumer + gRPC server (:3004) in one process
uv run alembic upgrade head         # apply migrations
uv run python scripts/gen_proto.py  # regenerate grpc_gen/ (gitignored) from ai.proto + polls.proto — rerun after editing either
```

`.env`: `DATABASE_URL`, `RABBITMQ_URL` (same CloudAMQP broker as the Nest apps), `VOYAGE_API_KEY`, `GEMINI_API_KEY`, `AI_SERVICE_PORT` (default 3004).

### Architecture notes (not obvious from the code alone — see the referenced files for the rest)

- `grpclib`, not `grpcio` — `grpcio`'s compiled extension is blocked by Smart App Control on the primary dev machine. `grpclib` is pure-Python, wire-compatible with the Node `@grpc/grpc-js` client. `grpcio-tools` stays dev-only, just for the `protoc` compiler.
- `AiModule`'s gRPC client needs `loader: { defaults: true }` (see its comment) or proto3 silently drops default-valued fields from responses.
- LLM is Gemini (`google-genai`), not Anthropic — no free tier on the Messages API. Model is pinned, not the `-latest` alias (see `llm/constants.py` for why).
- Embeddings are Voyage (`voyage-4-lite`, 200M free tokens, no card required).
- `poll_embeddings` (own Postgres, `vector(1024)`): one row per poll, populated from `ROUTING_KEYS.POLL_CREATED`. Write-once — polls have no update/delete RPC.
- `polls_client.py` — a `grpclib` client to the real `polls` service, used only by the Q&A agent's tools.

### RPCs (`AiService`, `libs/shared/src/ai/ai.proto`) → gateway routes

- `CheckDuplicatePoll` → `POST /polls/duplicate-check` — pgvector similarity on title+description; see `search/constants.py` for the calibrated threshold and its caveat (title-level duplicates can slip through if the description is off-topic).
- `SearchPolls` → `POST /polls/search` (public) — Gemini extracts a topic + category/date filters, one pgvector+SQL query. Returns `{pollId, similarity}` only; full poll data is re-fetched from `polls` as normal.
- `CheckPollNeutrality` → `POST /polls/neutrality-check` — flags loaded/leading title/option wording with suggested rewrites.
- `Chat` → `POST /polls/chat` — tool-calling agent (`qa_agent/`), **not RAG**: vote counts/dates are live facts, not embeddable docs. Server-streaming RPC adapted to SSE at the gateway (POST, not GET+`EventSource` — history doesn't fit a query string). See `qa_agent/chat.py` for the tool-call-loop and streaming-granularity notes.

### Frontend touches

`CreatePollForm.tsx` (duplicate + neutrality checks, run in parallel, one `PollPreflightWarnings` panel), `PollsAiSearchBar` (explicit-submit, not live-as-you-type), `ChatWidget`/`ChatPanel` (`src/components/chat/`, floating widget, signed-in only).

## Smart contracts (`contracts/`)

Hardhat project (Hardhat 3, viem-based toolbox), independent `package.json`/`node_modules` from `backend/`.

- `contracts/PollVoting.sol` — thin wrapper around the canonical `@semaphore-protocol/contracts` Semaphore contract: **one shared `PollVoting` instance for every poll**, not one contract per poll. `createPoll`/`addMember` are `onlyOwner` (the relayer address); `castVote` is unrestricted — the ZK proof is what authorizes a vote, not the caller.
- `npm run compile` / `npm test` (Hardhat test, `test/PollVoting.test.ts`) / `npm run deploy:sepolia` (Hardhat Ignition, `ignition/modules/`).
- Its own `.env`: `SEPOLIA_RPC_URL`, `RELAYER_ADDRESS` (the deployer — must match `blockchain`'s relayer account, since that's the address `onlyOwner` checks against on-chain), `ETHERSCAN_API_KEY`.
- The deployed address goes into `apps/blockchain/.env` as `POLL_VOTING_CONTRACT_ADDRESS` — nothing reads it from `contracts/` at runtime.

## Frontend (`frontend/`)

### Commands

Run from `frontend/`:

```bash
npm run dev     # next dev -p 5000
npm run build
npm run start
npm run lint
```

No test runner is configured. Husky + lint-staged run eslint/prettier on staged `.ts(x)` files pre-commit.

### Notes

- **Next.js version note** (from `frontend/AGENTS.md`): this project pins a Next.js version with breaking changes vs. older/training-data conventions — check `node_modules/next/dist/docs/` for the relevant guide before assuming familiar API/conventions/file structure, and heed deprecation notices.
- App Router (`src/app`), Tailwind v4, shadcn-style primitives in `src/components/ui`.
- **No wallet integration** — wagmi/RainbowKit were tried and removed; see the Key decisions note above before adding any wallet-connect UI back.
- ZK voting flow (`src/lib/voting/`): `identity.ts` generates a random `@semaphore-protocol/identity` keypair per poll on first vote and persists it in `localStorage` (deliberately — see the file's comment on why that's a different threat model than the access token); `generate-vote-proof.ts` builds the Semaphore proof; `use-cast-vote.ts` is the hook orchestrating join-group → get-merkle-proof → generate-proof → submit-vote (`src/lib/api/voting.ts`), surfaced in the `PollVote*` components under `src/components/polls/`.
- `/profile` page (`src/app/profile/`, components under `src/components/profile/`): account details, password change/set (Google-only accounts have none), avatar upload, sign-out-everywhere, and deactivate-account (typed confirmation phrase + password). See the backend's **File storage (R2)** note for how avatar upload works.
- Auth state: Zustand store (`src/lib/store/auth-store.ts`) holds the access token in memory; `src/lib/api/client.ts` is an axios instance that attaches it as a Bearer header and transparently retries once via `/auth/refresh` (using the httpOnly cookie) on a 401, queuing concurrent requests while a refresh is in flight.
- Forms use `react-hook-form` + `zod` (`src/lib/validation`).

## Roadmap (not built yet — keep new work compatible with these)

- `ai-service`: lightweight anomaly detection on voting patterns, consuming the existing `VOTE_CAST` event — lowest priority of the AI features, thin on genuine ML signal since Semaphore anonymity strips the identity/device/geo signals real voting-fraud detection usually relies on.
- `ai-service` `Chat`: true token-by-token streaming for the final answer — see `qa_agent/chat.py` for the current deliberate simplification.
- Unit tests — essentially none beyond Nest's generated scaffold spec files,
  with one real exception: `semaphore.service.spec.ts` covers the
  Sybil-resistance gate in `SemaphoreService.joinGroup`.
