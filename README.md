<div align="center">

<img src="docs/media/logo.png" alt="Web3 Voting System" width="96" />

# Web3 Voting System

**Anonymous, verifiable polls on Ethereum.**
Every vote is a zero-knowledge proof: anyone can check the tally on-chain, and nobody can tell who voted for what.

[![CI](https://github.com/Nikolla2000/Web3-Voting-System/actions/workflows/ci.yml/badge.svg)](https://github.com/Nikolla2000/Web3-Voting-System/actions/workflows/ci.yml)
[![Docker images](https://github.com/Nikolla2000/Web3-Voting-System/actions/workflows/docker.yml/badge.svg)](https://github.com/Nikolla2000?tab=packages&repo_name=Web3-Voting-System)
![Network](https://img.shields.io/badge/network-Sepolia_testnet-6366f1)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

<br />

<img src="docs/media/overview.gif" alt="A short tour of the app: polls, a single poll, the profile page" width="860" />

</div>

## Table of contents

1. [About](#about)
2. [Highlights](#highlights)
3. [Architecture](#architecture)
4. [How anonymous voting works](#how-anonymous-voting-works)
5. [Features](#features)
6. [Under the hood](#under-the-hood)
7. [Testing and CI/CD](#testing-and-cicd)
8. [Running locally](#running-locally)
9. [Challenges and solutions](#challenges-and-solutions)
10. [What I learned](#what-i-learned)

## About

Web3 Voting System is a polling platform where voting is private by construction rather than by policy. You sign in with an ordinary account, pick a poll and vote. Your browser generates a [Semaphore](https://semaphore.pse.dev/) zero-knowledge proof that says "I am a registered member of this poll's group and I haven't voted yet" without saying which member. A relayer submits the proof to a smart contract on the Sepolia testnet, the contract verifies it, and the tally is updated. The platform can't link a vote to an account, and neither can anyone reading the chain.

It is also a deliberately broad portfolio project. It is built as a set of microservices that talk over different protocols (HTTP, TCP, gRPC, RabbitMQ), with a Solidity contract, a Python AI service and a full CI/CD pipeline around them, to show how these pieces fit together in one working system.

> The contracts live on the **Sepolia testnet** only. There is no real money involved and nothing here is audited for production elections.

<div align="center">
<img src="docs/media/polls-page.png" alt="The polls page with search, status filters and poll cards" width="860" />
</div>

## Highlights

- **Anonymous voting with zero-knowledge proofs.** Semaphore proofs are generated in the browser, so the server never sees which voting identity belongs to which account.
- **One vote per person, enforced.** Each account can join a poll's group once, and the contract rejects a reused nullifier, so double voting fails without revealing the voter.
- **Verifiable on-chain.** Every vote is a transaction you can open on Etherscan, and the tally in the app is derived from the contract's own events.
- **Six services, four protocols.** REST at the edge, TCP, gRPC and RabbitMQ pub/sub inside, each used where it fits the job.
- **AI-assisted polls.** Duplicate detection with pgvector, a neutrality check for loaded wording, natural-language search and a Q&A chat agent.
- **Cached and rate limited.** Redis cache-aside with version-based invalidation, and per-endpoint rate limits backed by a Lua script.
- **Tested end to end.** Unit, integration and Docker-backed e2e suites, plus Playwright runs that generate a real in-browser proof.
- **Shipped like a product.** Path-filtered CI, production images published to GHCR, tagged releases and a gated Sepolia deploy workflow.

## Architecture

The browser only ever talks to the API gateway. Behind it, each service owns one job and its own database, and the services find out about each other's work through RabbitMQ events.

```mermaid
flowchart LR
    Browser["Browser<br/>Next.js, in-browser ZK proofs"]

    subgraph Backend["Backend services"]
        GW["API gateway<br/>NestJS, JWT, rate limits"]
        ID["identity<br/>users and tokens"]
        PO["polls<br/>polls and tallies"]
        BC["blockchain<br/>group membership and relayer"]
        AI["ai-service<br/>Python, search and chat"]
        NO["notifications<br/>emails"]
    end

    MQ{{"RabbitMQ<br/>exchange: voting_system"}}

    subgraph Data["Data stores"]
        PGI[("Postgres<br/>identity")]
        PGP[("Postgres<br/>polls")]
        PGB[("Postgres<br/>blockchain")]
        PGA[("Postgres + pgvector<br/>embeddings")]
        RD[("Redis<br/>cache and throttling")]
        R2[("Cloudflare R2<br/>images")]
    end

    subgraph Ext["External"]
        ETH["Sepolia<br/>PollVoting contract"]
        LLM["Gemini and Voyage"]
    end

    Browser -- "HTTPS, SSE" --> GW
    Browser -. "avatar upload" .-> R2
    GW -- TCP --> ID
    GW -- gRPC --> PO
    GW -- gRPC --> BC
    GW -- gRPC --> AI
    GW --- RD
    GW --- R2
    AI -- "gRPC" --> PO

    ID --- PGI
    PO --- PGP
    PO --- RD
    BC --- PGB
    AI --- PGA

    BC -- "signed transactions, VoteCast logs" --> ETH
    AI --> LLM

    ID -- publishes --> MQ
    PO -- publishes --> MQ
    BC -- publishes --> MQ
    MQ -- consumes --> NO
    MQ -- consumes --> PO
    MQ -- consumes --> BC
    MQ -- consumes --> AI
```

### Services

| Service | Role | Talks over | Data |
|---|---|---|---|
| `frontend` | Next.js app, generates voting identities and ZK proofs in the browser | HTTP to the gateway | none |
| `api-gateway` | The only public entry point: REST, Swagger, JWT checks, validation, rate limiting, poll cover uploads | HTTP in, TCP and gRPC out | Redis, R2 |
| `identity` | Registration, login, Google OAuth, refresh tokens, profile, avatars | TCP | Postgres (Prisma), R2 |
| `polls` | Poll CRUD, listing and search filters, cached vote tallies | gRPC | Postgres (Prisma), Redis |
| `blockchain` | Semaphore group membership, proof verification, the relayer that signs every on-chain transaction, and the indexer that reads vote events back | gRPC | Postgres (Prisma), Sepolia |
| `ai-service` | Duplicate detection, neutrality check, natural-language search, Q&A agent | gRPC | Postgres with pgvector |
| `notifications` | Welcome emails, driven only by events | RabbitMQ consumer | none |
| `contracts` | `PollVoting.sol`, a thin wrapper around the Semaphore contract, shared by all polls | n/a | Sepolia |

### Events

The services that don't call each other directly are connected by a handful of events on one RabbitMQ topic exchange:

| Routing key | Published by | Consumed by | Effect |
|---|---|---|---|
| `USER_REGISTERED` | identity | notifications | Sends the welcome email |
| `POLL_CREATED` | polls | blockchain, ai-service | Creates the poll's on-chain group; indexes the poll's embedding |
| `POLL_CONTRACT_DEPLOYED` | blockchain | polls | Stores the contract address on the poll |
| `VOTE_CAST` | blockchain | polls | Updates the cached tallies, once per vote |

### Why the protocols differ

The mix is intentional. Part of the goal of the project is to show each style in a working system, so the choices are not claimed to be the only sensible ones.

- **REST** is what browsers speak, so it exists only at the gateway.
- **TCP** (Nest microservice transport) covers `identity`, a small request and response service where a typed contract buys little.
- **gRPC** with `.proto` files covers the services with richer contracts, including streaming for the chat answer, and it is what lets a Python service and a TypeScript one share a schema.
- **RabbitMQ** carries anything that is a fact about the past rather than a request, like "a poll was created". Several independent services react to the same event without the sender knowing about them.

The gateway is also the single JWT authority. Downstream services trust the `userId` it forwards, which keeps authentication logic in one place.

## How anonymous voting works

The short version: the platform knows **who is allowed to vote**, the blockchain knows **what was voted**, and nothing connects the two.

<div align="center">
<img src="docs/media/voting.gif" alt="Casting a vote: pick an option, watch the proof being generated, then open the transaction on Etherscan" width="760" />
</div>

### The idea in plain English

1. **A secret you generate yourself.** The first time you vote in a poll, your browser creates a random [Semaphore](https://semaphore.pse.dev/) identity: a secret key plus a public fingerprint of it, called a commitment. The secret never leaves your browser.
2. **Joining the poll's group.** You send only the commitment to the server. It checks that your account hasn't joined this poll before (one account, one commitment per poll), and the relayer adds the commitment to the poll's group on the Sepolia contract. The group is a Merkle tree of everyone who may vote.
3. **Proving membership without revealing who you are.** Your browser builds a zero-knowledge proof that says "I know a secret whose commitment is somewhere in this group, and I choose option X". The proof doesn't say which member you are.
4. **Voting once.** The proof also carries a nullifier, a value derived from your secret and the poll. It is the same every time you vote in that poll and unlinkable to your commitment, so the contract can reject a second vote without knowing who cast the first.
5. **Anonymous sender.** The relayer, a single backend-owned account, submits the transaction. Every vote on every poll comes from the same address, so the sender tells you nothing about the voter.

### Vote flow

```mermaid
sequenceDiagram
    autonumber
    actor U as Voter (browser)
    participant GW as API gateway
    participant BC as blockchain service
    participant C as PollVoting contract
    participant MQ as RabbitMQ
    participant P as polls service

    U->>U: Generate identity (secret stays here)
    U->>GW: Join poll group (commitment only)
    GW->>BC: JoinGroup (commitment, userId)
    BC->>C: addMember(commitment), signed by relayer
    BC-->>U: Merkle root and index
    U->>GW: Request Merkle proof
    GW->>BC: GetMerkleProof
    BC-->>U: Siblings of the commitment in the tree
    U->>U: Generate ZK proof in the browser (option, poll, nullifier)
    U->>GW: Submit proof (no userId forwarded)
    GW->>BC: SubmitVote
    BC->>BC: Verify proof, scope and root
    BC->>C: castVote(proof), signed by relayer
    C->>C: Semaphore verifies proof, rejects reused nullifier
    C-->>BC: VoteCast event
    BC-->>U: Transaction hash
    BC->>MQ: Publish VOTE_CAST
    MQ->>P: Deliver event
    P->>P: Update cached tallies, once per nullifier
```

Two details that make this hold together:

- **Poll and option IDs become field elements.** Semaphore works with numbers in a finite field, not UUIDs. The poll ID becomes the proof's scope and the option ID becomes its message, converted by the same function in the browser and in the backend. If the two sides ever disagree, proof verification fails.
- **The Merkle tree is rebuilt from rows.** The `blockchain` service keeps each poll's tree in memory, but the source of truth is the `GroupMember` table, so a restart never invalidates the membership or the proofs already issued.

### What is and isn't private

| Private | Not hidden |
|---|---|
| Which commitment cast which vote | The result: every vote and its chosen option is public on-chain |
| Any link between an account and its vote | That an account joined a poll's group, because the server stores the account to commitment link to enforce one vote per person |
| The identity secret, which never leaves the browser | Timing: joining and voting happen seconds apart from the same session, which matters in small groups |
| The voter's own address, since the relayer sends everything | The relayer: a malicious operator could log IP addresses and request times |

Other honest limits:

- **The voting identity lives in `localStorage`.** Clearing site data, or switching browser, after joining means you can't vote in that poll any more, since your account has already used its one slot.
- **Small groups give weak anonymity.** A group with one member is trivially identifiable. The guarantee gets stronger as more people join.
- **Sepolia testnet only.** The contracts are the standard Semaphore ones plus a thin owner-restricted wrapper, but nothing here has been audited.

## Features

### Accounts

- Email and password registration with validation, and Google sign-in.
- Short-lived access tokens held in memory only, plus a rotating refresh token in an httpOnly cookie. Refreshes are single-flight, so parallel requests never race each other with a used token.
- Profile page: account details, password change, avatar upload straight to R2 with a presigned URL, sign out everywhere and account deactivation behind a typed confirmation.
- Welcome email sent asynchronously through RabbitMQ.

### Polls

- Create polls with a title, description, category, schedule, cover image and two or more unique options.
- Browse with text search, status filters (all, active, upcoming, ended), sorting and pagination.
- Live vote bars on each card and on the poll page, refreshed automatically while a poll is active.
- Cover images are uploaded as pending files and only attached to the poll once it is created, so abandoned uploads expire on their own.

### Voting

- One anonymous vote per account per poll, using a Semaphore proof generated in the browser. See [How anonymous voting works](#how-anonymous-voting-works).
- A step-by-step progress indicator while the identity is registered, the proof is generated and the transaction is submitted.
- A transaction hash with a link to Etherscan once the vote is on-chain.

### AI assistance

- **Duplicate detection.** While you write a poll, its title and description are compared with existing polls using pgvector similarity, and you see the closest match with a percentage.
- **Neutrality check.** Flags loaded or leading wording in the title and options and suggests rewrites. It runs in parallel with the duplicate check and both land in one warning panel.
- **Natural-language search.** Type something like "climate polls from last month" and the model extracts a topic plus category and date filters for a single vector and SQL query.
- **Q&A chat.** A tool-calling agent that answers questions about polls by reading live data, streamed to the browser over Server-Sent Events.

<div align="center">
<img src="docs/media/duplicate-check.gif" alt="Creating a poll with a similar title triggers a duplicate warning with a similarity percentage" width="620" />
</div>

<!-- TODO: add a GIF or screenshot of the AI chat once the chat error is fixed. -->

## Under the hood

Each choice below is there for a reason, and a few are there mainly to show a different technique.

### Frontend

| Tool | Why |
|---|---|
| Next.js 16 and React 19 | App Router, and a standalone build that makes the production image small (about 300 MB). |
| Tailwind CSS v4 and shadcn-style components | Every UI element is its own small component, with no template-library look. |
| TanStack Query | Server state, caching and the active-poll refetch, instead of hand-written loading flags. |
| Zustand | A tiny in-memory store for the access token, which must never touch `localStorage`. |
| react-hook-form and zod | One schema validates a form and types it. |
| Semaphore JS packages | Identity creation and Groth16 proving in the browser, so the secret never leaves it. |
| Axios with an interceptor | Attaches the token and retries once through the refresh endpoint on a 401. |

### Backend

| Tool | Why |
|---|---|
| NestJS monorepo | Several apps share one `libs/shared` for constants, DTOs, proto files and the RabbitMQ and R2 wrappers. |
| Prisma and PostgreSQL | A separate database per service, so no service reads another's tables. |
| gRPC (`@grpc/grpc-js`) | Strongly typed contracts shared with the Python service, plus streaming for the chat. |
| Raw `amqplib` | This is publish and subscribe with independent consumers, not request and reply, which is what Nest's built-in RMQ transport is for. |
| Redis (ioredis) | Cache-aside for poll data and storage for rate-limit counters, via a Lua script. |
| Cloudflare R2 | S3-compatible image storage with a separate bucket and scoped token per service. |
| viem | Typed contract calls, transaction signing and event watching for the relayer. |
| `@semaphore-protocol/*` | Group and Merkle proof handling, and off-chain proof verification before spending gas. |
| Passport, JWT and bcrypt | Google OAuth and password sign-in, with the gateway as the only token authority. |
| Swagger | Generated API docs at the gateway. |

### Smart contracts

| Tool | Why |
|---|---|
| Solidity 0.8.23 | `PollVoting` is a thin wrapper that adds poll bookkeeping to Semaphore. |
| Semaphore | An audited, widely used protocol for anonymous membership proofs, instead of a home-made one. |
| OpenZeppelin `Ownable` | Only the relayer can create polls and add members, while anyone can submit a valid proof. |
| Hardhat 3 and viem | Compilation and tests, using the same client library as the backend. |
| Hardhat Ignition | Repeatable deployments, with the Sepolia deployment record committed so a redeploy is a no-op. |

### AI service

| Tool | Why |
|---|---|
| Python 3.12 and uv | Fast, locked, reproducible environments. |
| Voyage embeddings | A generous free tier and a good retrieval model for short texts. |
| pgvector | Similarity search inside the same Postgres as the rest of the service's data, with no separate vector database. |
| Gemini | The model behind search parsing, the neutrality check and the chat agent. |
| `grpclib` | A pure-Python gRPC implementation, wire-compatible with the Node client. |
| SQLAlchemy and Alembic | Async access and versioned migrations. |

### Infrastructure

| Tool | Why |
|---|---|
| Docker Compose | One command for the local databases, and a production file that runs published images. |
| GitHub Actions | Path-filtered CI, image publishing, releases and a gated deployment. See [Testing and CI/CD](#testing-and-cicd). |
| GitHub Container Registry | Hosts the production image of each service, tagged by commit and by version. |
| CloudAMQP, Upstash and Cloudflare R2 | Hosted free tiers for the broker, Redis and storage, so there is less to run locally. |
