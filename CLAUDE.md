# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent projects, not a unified monorepo tool (no root package.json):

- `backend/` — NestJS monorepo (5 apps + 1 shared lib), managed by `nest-cli.json`
- `frontend/` — Next.js 16 / React 19 app

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
- `walletAddress` on the User model was added earlier in the project to connect wallet address to the  relevant user and  for Sybil-resistance. But true voter anonymity comes later via Semaphore ZK proofs on-chain which is what i want to be done later and thats why it might be removed later from the database.
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

Run from `backend/`. This is a Nest **monorepo** — most CLI commands take a project name (see `nest-cli.json` for the list: `api-gateway`, `auth`, `identity`, `notifications`, `polls`, `shared`). `api-gateway` is the default project.

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

Each service loads its own `.env` (backend/.env for api-gateway; `apps/identity/.env`, `apps/polls/.env`, `apps/notifications/.env` for the others). `identity` and `polls` each have their own Prisma schema/DB — after editing either, regenerate from that app's directory context (schema paths: `apps/identity/prisma/schema.prisma`, `apps/polls/prisma/schema.prisma`; generated clients land in each app's `src/generated/prisma`, gitignored).

Path alias: `@app/shared` / `@app/shared/*` → `libs/shared/src` (set in root `tsconfig.json`, mirrored in Jest's `moduleNameMapper`).

### Architecture

This is a microservices voting platform. The API gateway is the only HTTP-facing service; everything else speaks internal protocols:

| App | Role | Transport | Port |
|---|---|---|---|
| `api-gateway` | Public REST API, Swagger docs, JWT auth guard, request validation | HTTP | 3000 |
| `identity` | Users, registration/login, JWT issuance, Google OAuth, refresh tokens (own Postgres via Prisma) | TCP microservice | 3001 |
| `polls` | Poll CRUD, vote tallying (own Postgres via Prisma) | gRPC (`libs/shared/src/polls/polls.proto`) | 3002 |
| `notifications` | Welcome emails, etc. | No inbound transport — `NestFactory.createApplicationContext`, driven by RabbitMQ consumers only |
| `auth` | **Unused scaffold** left over from `nest generate app` — not wired into the real auth flow. Real auth lives in `identity/src/auth` (service logic) and `api-gateway/src/auth` (gateway-side proxy/guards). Don't confuse the two. |

`api-gateway` proxies requests rather than implementing business logic itself:
- `api-gateway/src/auth/auth-proxy.controller.ts` — HTTP endpoints that forward to `identity` over a TCP `ClientProxy` using message patterns from `AUTH_PATTERNS`/`USERS_PATTERNS` (`libs/shared/src/auth/auth.patterns.ts`, `.../users/users.patterns.ts`). `auth-proxy.service.ts` is dead code (fully commented out) — the controller talks to the client directly instead.
- `api-gateway/src/polls/polls-proxy.controller.ts` — forwards to `polls` over gRPC (`ClientGrpc`, service name `PollsService`).
- Refresh tokens are set as an httpOnly cookie by the gateway; access tokens are short-lived JWTs (15m) returned in the response body and attached client-side as a Bearer header.

**Shared lib** (`libs/shared`, imported as `@app/shared`): message pattern constants, DTOs, RabbitMQ wrapper services (`RabbitMQConnectionService`/`Publisher`/`Consumer`, exchange `voting_system`), RPC exception helpers. Routing keys live in `rabbitmq.constants.ts` (`ROUTING_KEYS`) — note `POLLS_EVENTS.VOTE_CAST` (`libs/shared/src/polls/polls.events.ts`, value `'vote.cast'`) and `ROUTING_KEYS.VOTE_CAST` (value `'polls.vote_cast'`) are two different constants with overlapping intent; check which one a given consumer/publisher actually binds to before assuming they match.

**Vote flow**: on-chain votes (Semaphore proofs) are expected to be picked up by a not-yet-built blockchain-indexer service, which will publish a `vote.cast`-style event to RabbitMQ. `polls/src/events/vote-sync.consumer.ts` already consumes this, incrementing cached `Poll.totalVotes`/`PollOption.votes` in Postgres inside a transaction. It's idempotent against at-least-once redelivery via a `ProcessedVote` unique constraint on `(pollId, nullifierHash)` — duplicate deliveries are caught via Prisma's `P2002` and swallowed.

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
- Wallet/chain integration: wagmi + RainbowKit, configured for Sepolia only (`src/lib/web3/config.ts`). `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is required at build/boot or config throws.
- Auth state: Zustand store (`src/lib/store/auth-store.ts`) holds the access token in memory; `src/lib/api/client.ts` is an axios instance that attaches it as a Bearer header and transparently retries once via `/auth/refresh` (using the httpOnly cookie) on a 401, queuing concurrent requests while a refresh is in flight.
- Forms use `react-hook-form` + `zod` (`src/lib/validation`).

## Roadmap (not built yet — keep new work compatible with these)

- Solidity contracts on Sepolia (`contracts/`, not started)
- Semaphore ZK proofs for anonymous on-chain voting
- Blockchain-indexer service publishing `vote.cast`, consumed by
  `polls` (consumer already exists and waits for this)
- Google OAuth (`GoogleButton` is currently a stub)
- Redis — planned, not implemented
- Some kind of AI service, which will use vector databases, RAG and other AI things to show knowledge, possibly written in python
- Unit tests

## Current focus

`/polls/[id]` detail page — replace mock data with TanStack Query
calls to the real `polls` API.
