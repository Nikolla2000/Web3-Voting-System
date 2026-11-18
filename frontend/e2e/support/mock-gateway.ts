import { randomBytes, randomUUID } from 'node:crypto';
import type { BrowserContext, Request, Route } from '@playwright/test';
import { verifyProof, type SemaphoreProof } from '@semaphore-protocol/proof';
// The backend's own copy, not the frontend's mirror of it: a vote only verifies if the browser
// derives scope/message exactly as the blockchain service does, and that's what this checks.
import { uuidToFieldElement } from '../../../backend/libs/shared/src/blockchain/identifier.util';
import { APP_URL, GATEWAY_URL, R2_URL } from './urls';

/**
 * An in-memory stand-in for the API gateway, served through Playwright request interception.
 *
 * It's stateful (users, sessions, polls, group members, nullifiers) so a test can walk a real
 * flow: register, create a poll, vote, see the tally. Behaviour the frontend depends on is
 * reproduced on purpose: the response envelope, the refresh token in an httpOnly cookie that
 * rotates on every use, 401 for a missing or expired access token, CORS with credentials, and
 * proto3 dropping empty repeated fields. Anything it has no handler for is recorded in
 * `unhandled`, and the test fixture fails the test on it.
 */

export interface MockUser {
  id: string;
  username: string;
  email: string;
  password: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface MockPoll {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  /** Upper-case, as the polls service sends it (e.g. 'TRAVEL'). */
  category: string;
  startsAt: string;
  endsAt: string;
  contractAddress: string | null;
  creatorId: string;
  options: { id: string; label: string; votes: number }[];
}

export interface RecordedRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: Buffer | null;
  json: unknown;
}

interface Reply {
  status?: number;
  data?: unknown;
  /** A non-enveloped body, sent as-is (SSE, error bodies). */
  raw?: string;
  contentType?: string;
  headers?: Record<string, string>;
}

interface Ctx {
  req: RecordedRequest;
  /** The route's :id segments, in order. */
  params: string[] & { 0: string };
  query: URLSearchParams;
  userId: string | null;
}

type Handler = (ctx: Ctx) => Reply | Promise<Reply>;

const REFRESH_COOKIE = 'refresh_token';
const DAY = 24 * 60 * 60 * 1000;
// A 1x1 transparent PNG, served for any image the mock "stores".
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

const envelope = (data: unknown, statusCode: number) => ({
  data,
  statusCode,
  success: true,
  timestamp: new Date().toISOString(),
});
const error = (status: number, message: string): Reply => ({
  status,
  raw: JSON.stringify({ statusCode: status, message, success: false }),
});
const token = (prefix: string) => `${prefix}-${randomBytes(8).toString('hex')}`;

export class MockGateway {
  readonly users = new Map<string, MockUser>();
  readonly polls: MockPoll[] = [];
  readonly requests: RecordedRequest[] = [];
  readonly unhandled: string[] = [];
  /** Avatar objects PUT to the fake R2 bucket, by key. */
  readonly r2Objects = new Map<string, { contentType: string; body: Buffer }>();

  /** What the AI checks answer; tests override these. */
  duplicateMatches: { pollId: string; title: string; similarity: number }[] = [];
  neutralityIssues: { text: string; explanation: string; suggestion: string }[] = [];
  searchResults: (query: string) => { pollId: string; similarity: number }[] = () => [];
  chatReply: (message: string, history: unknown[]) => string[] = () => [
    'I can only talk about polls.',
  ];

  private readonly accessTokens = new Map<string, string>();
  private readonly refreshTokens = new Map<string, string>();
  private readonly groups = new Map<string, string[]>();
  private readonly nullifiers = new Set<string>();
  private readonly routes: [string, RegExp, Handler, { auth: boolean }][] = [];

  constructor() {
    this.defineRoutes();
  }

  // ---- seeding ----------------------------------------------------------------------------

  addUser(overrides: Partial<MockUser> = {}): MockUser {
    const user: MockUser = {
      id: randomUUID(),
      username: 'alice',
      email: 'alice@example.com',
      password: 'Secret123',
      avatar: null,
      createdAt: '2026-01-15T10:00:00.000Z',
      ...overrides,
    };
    this.users.set(user.id, user);
    return user;
  }

  addPoll(
    overrides: Partial<Omit<MockPoll, 'options'>> & {
      options?: (string | [string, number])[];
    } = {},
  ): MockPoll {
    const { options = ['Lisbon', 'Prague'], ...rest } = overrides;
    const poll: MockPoll = {
      id: randomUUID(),
      title: 'Best city for a weekend trip?',
      description: 'Pick the city you would most like to visit.',
      imageUrl: `${R2_URL}/polls/cover.png`,
      category: 'TRAVEL',
      startsAt: new Date(Date.now() - DAY).toISOString(),
      endsAt: new Date(Date.now() + 3 * DAY).toISOString(),
      contractAddress: '0x' + 'ab'.repeat(20),
      creatorId: 'someone-else',
      ...rest,
      options: options.map((o) => {
        const [label, votes] = typeof o === 'string' ? [o, 0] : o;
        return { id: randomUUID(), label, votes };
      }),
    };
    this.polls.unshift(poll);
    return poll;
  }

  /** Starts the browser with a valid refresh cookie, as if the user had signed in earlier. */
  async signIn(context: BrowserContext, user: MockUser) {
    const refresh = token('refresh');
    this.refreshTokens.set(refresh, user.id);
    await context.addCookies([
      { name: REFRESH_COOKIE, value: refresh, url: GATEWAY_URL, httpOnly: true, sameSite: 'Lax' },
    ]);
  }

  /** Every access token issued so far now gets a 401, as when the 15-minute JWT expires. */
  expireAccessTokens() {
    this.accessTokens.clear();
  }

  requestsTo(method: string, path: string | RegExp) {
    return this.requests.filter(
      (r) =>
        r.method === method && (typeof path === 'string' ? r.path === path : path.test(r.path)),
    );
  }

  // ---- wiring -----------------------------------------------------------------------------

  async install(context: BrowserContext) {
    await context.route(`${GATEWAY_URL}/**`, (route) => this.handleGateway(route));
    await context.route(`${R2_URL}/**`, (route) => this.handleR2(route));
  }

  private cors(request: Request): Record<string, string> {
    return {
      'access-control-allow-origin': APP_URL,
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers':
        request.headers()['access-control-request-headers'] ?? 'content-type,authorization',
      // As the real gateway's enableCors does, so the 429 countdown can read it.
      'access-control-expose-headers': 'Retry-After',
    };
  }

  private async record(request: Request, prefix: string): Promise<RecordedRequest> {
    const url = new URL(request.url());
    const headers = await request.allHeaders();
    const body = request.postDataBuffer();
    let json: unknown = null;
    if (body && headers['content-type']?.includes('application/json'))
      json = JSON.parse(body.toString('utf8'));
    const recorded = {
      method: request.method(),
      path: url.pathname.replace(prefix, '') || '/',
      headers,
      body,
      json,
    };
    return recorded;
  }

  private async handleGateway(route: Route) {
    const request = route.request();
    const cors = this.cors(request);
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

    const req = await this.record(request, '');
    this.requests.push(req);
    const query = new URL(request.url()).searchParams;

    for (const [method, pattern, handler, { auth }] of this.routes) {
      const match = req.method === method ? pattern.exec(req.path) : null;
      if (!match) continue;

      const bearer = req.headers['authorization']?.replace(/^Bearer /, '');
      const userId = bearer ? (this.accessTokens.get(bearer) ?? null) : null;
      const reply =
        auth && !userId
          ? error(401, 'Unauthorized')
          : await handler({ req, params: match.slice(1) as Ctx['params'], query, userId });

      const status = reply.status ?? 200;
      return route.fulfill({
        status,
        headers: { ...cors, ...reply.headers },
        contentType: reply.contentType ?? 'application/json',
        body: reply.raw ?? JSON.stringify(envelope(reply.data ?? null, status)),
      });
    }

    this.unhandled.push(`${req.method} ${req.path}`);
    return route.fulfill({
      status: 501,
      headers: cors,
      body: '{"message":"No mock for this route"}',
    });
  }

  private async handleR2(route: Route) {
    const request = route.request();
    const cors = this.cors(request);
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const req = await this.record(request, R2_URL);
    const key = req.path.replace(/^\//, '');

    if (req.method === 'PUT') {
      if (!new URL(request.url()).searchParams.has('X-Amz-Signature'))
        return route.fulfill({ status: 403, headers: cors });
      this.r2Objects.set(key, {
        contentType: req.headers['content-type'] ?? '',
        body: req.body ?? Buffer.alloc(0),
      });
      this.requests.push({ ...req, path: `R2 ${req.path}` });
      return route.fulfill({ status: 200, headers: cors });
    }
    // Any GET is an image the app displays (poll covers, avatars).
    return route.fulfill({ status: 200, headers: cors, contentType: 'image/png', body: PNG });
  }

  private on(method: string, path: string, handler: Handler, options = { auth: false }) {
    // ':id' segments become capture groups.
    const pattern = new RegExp(`^${path.replace(/:[a-z]+/gi, '([^/]+)')}$`);
    this.routes.push([method, pattern, handler, options]);
  }

  private authed(method: string, path: string, handler: Handler) {
    this.on(method, path, handler, { auth: true });
  }

  // ---- sessions ---------------------------------------------------------------------------

  private startSession(user: MockUser): Reply {
    const access = token('access');
    const refresh = token('refresh');
    this.accessTokens.set(access, user.id);
    this.refreshTokens.set(refresh, user.id);
    return {
      data: { user: this.authUser(user), accessToken: access },
      headers: { 'set-cookie': `${REFRESH_COOKIE}=${refresh}; Path=/; HttpOnly; SameSite=Lax` },
    };
  }

  private refreshCookie(req: RecordedRequest): string | null {
    const match = /(?:^|;\s*)refresh_token=([^;]+)/.exec(req.headers['cookie'] ?? '');
    return match?.[1] ?? null;
  }

  private authUser(user: MockUser) {
    return { id: user.id, username: user.username, email: user.email, avatar: user.avatar };
  }

  private profile(user: MockUser) {
    return {
      ...this.authUser(user),
      role: 'USER',
      isActive: true,
      hasPassword: user.password !== null,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    };
  }

  private user(id: string | null): MockUser {
    return this.users.get(id!)!;
  }

  private poll(id: string): MockPoll | undefined {
    return this.polls.find((p) => p.id === id);
  }

  private pollResponse(poll: MockPoll) {
    const { options, ...rest } = poll;
    const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);
    // proto3 drops empty repeated fields, so a poll without options arrives without the key.
    return { ...rest, totalVotes, ...(options.length ? { options } : {}) };
  }

  // ---- routes -----------------------------------------------------------------------------

  private defineRoutes() {
    this.on('POST', '/auth/register', ({ req }) => {
      const { username, email, password } = req.json as Record<string, string>;
      if ([...this.users.values()].some((u) => u.email === email))
        return error(409, 'Email is already registered');
      return { ...this.startSession(this.addUser({ username, email, password })), status: 201 };
    });

    this.on('POST', '/auth/login', ({ req }) => {
      const { email, password } = req.json as Record<string, string>;
      const user = [...this.users.values()].find(
        (u) => u.email === email && u.password === password,
      );
      return user ? this.startSession(user) : error(401, 'Invalid email or password');
    });

    this.on('POST', '/auth/refresh', ({ req }) => {
      const cookie = this.refreshCookie(req);
      const userId = cookie ? this.refreshTokens.get(cookie) : undefined;
      if (!cookie || !userId) return error(401, 'Invalid refresh token');
      // Single use, as in identity: a second refresh with the same cookie is rejected.
      this.refreshTokens.delete(cookie);
      const { data, headers } = this.startSession(this.user(userId));
      return { data: { accessToken: (data as { accessToken: string }).accessToken }, headers };
    });

    this.on('POST', '/auth/logout', ({ req }) => {
      const cookie = this.refreshCookie(req);
      if (cookie) this.refreshTokens.delete(cookie);
      return { headers: { 'set-cookie': `${REFRESH_COOKIE}=; Path=/; HttpOnly; Max-Age=0` } };
    });

    this.authed('GET', '/users/me', ({ userId }) => ({ data: this.profile(this.user(userId)) }));

    this.authed('PATCH', '/users/me', ({ req, userId }) => {
      const user = this.user(userId);
      Object.assign(user, req.json as Partial<Pick<MockUser, 'username' | 'email'>>);
      return { data: this.profile(user) };
    });

    this.authed('POST', '/users/me/avatar/upload-url', ({ userId }) => {
      const key = `avatars/${userId}/${randomUUID()}.png`;
      return {
        data: {
          uploadUrl: `${R2_URL}/${key}?X-Amz-Signature=${token('sig')}`,
          key,
          publicUrl: `${R2_URL}/${key}`,
        },
      };
    });

    this.authed('PATCH', '/users/me/avatar', ({ req, userId }) => {
      const { key } = req.json as { key: string };
      // identity checks the key is the user's and that the object really was uploaded.
      if (!key.startsWith(`avatars/${userId}/`) || !this.r2Objects.has(key))
        return error(400, 'Avatar upload not found');
      const user = this.user(userId);
      user.avatar = `${R2_URL}/${key}`;
      return { data: this.profile(user) };
    });

    this.on('GET', '/polls', () => {
      const items = this.polls.map((p) => this.pollResponse(p));
      return { data: { items, total: items.length, page: 1, limit: 50 } };
    });

    this.on('GET', '/polls/:id', ({ params: [id] }) => {
      const poll = this.poll(id);
      return poll ? { data: this.pollResponse(poll) } : error(404, 'Poll not found');
    });

    this.authed('POST', '/polls/images', ({ req }) => {
      // Rejected unless it really is multipart: a serialised body would never carry the file.
      if (!/^multipart\/form-data; boundary=/.test(req.headers['content-type'] ?? ''))
        return error(400, 'File is required');
      return { status: 201, data: { url: `${R2_URL}/polls/${randomUUID()}.png` } };
    });

    this.authed('POST', '/polls', ({ req, userId }) => {
      const body = req.json as Omit<
        MockPoll,
        'options' | 'id' | 'creatorId' | 'contractAddress'
      > & { options: string[] };
      const poll = this.addPoll({ ...body, creatorId: userId!, contractAddress: null });
      return { status: 201, data: this.pollResponse(poll) };
    });

    this.authed('POST', '/polls/duplicate-check', () => ({
      data: { matches: this.duplicateMatches },
    }));
    this.authed('POST', '/polls/neutrality-check', () => ({
      data: { isNeutral: this.neutralityIssues.length === 0, issues: this.neutralityIssues },
    }));
    this.on('POST', '/polls/search', ({ req }) => ({
      data: { results: this.searchResults((req.json as { query: string }).query) },
    }));

    this.authed('POST', '/polls/chat', ({ req }) => {
      const { message, history } = req.json as { message: string; history: unknown[] };
      const deltas = this.chatReply(message, history);
      const events = deltas.map(
        (textDelta) => `event: message\ndata: ${JSON.stringify({ textDelta })}\n\n`,
      );
      return {
        raw: `${events.join('')}event: done\ndata: {}\n\n`,
        contentType: 'text/event-stream',
      };
    });

    // ---- voting: what the blockchain service does, minus the chain ----

    this.authed('POST', '/polls/:id/group/join', ({ req, params: [pollId] }) => {
      const { identityCommitment } = req.json as { identityCommitment: string };
      const members = this.groups.get(pollId) ?? [];
      if (!members.includes(identityCommitment)) members.push(identityCommitment);
      this.groups.set(pollId, members);
      // Kept to one member per poll: a one-leaf LeanIMT's root is the leaf itself.
      return {
        status: 201,
        data: { root: members[0], index: members.indexOf(identityCommitment) },
      };
    });

    this.authed('GET', '/polls/:id/group/merkle-proof', ({ params: [pollId], query }) => {
      const commitment = query.get('identityCommitment')!;
      if (!this.groups.get(pollId)?.includes(commitment))
        return error(404, 'Not a member of this poll');
      // No `siblings` key at all: a one-member proof's siblings are [], which proto3 drops.
      return { data: { root: commitment, index: 0 } };
    });

    this.authed('POST', '/polls/:id/vote', async ({ req, params: [pollId] }) => {
      const proof = req.json as SemaphoreProof;
      const poll = this.poll(pollId);
      if (!poll) return error(404, 'Poll not found');
      if (!this.groups.get(pollId)?.includes(proof.merkleTreeRoot))
        return error(400, 'Unknown Merkle root');
      if (proof.scope !== uuidToFieldElement(pollId).toString())
        return error(400, 'Proof is for a different poll');
      const option = poll.options.find(
        (o) => uuidToFieldElement(o.id).toString() === proof.message,
      );
      if (!option) return error(400, 'Proof is for an unknown option');
      if (this.nullifiers.has(proof.nullifier))
        return error(409, 'This identity has already voted');
      if (!(await verifyProof(proof))) return error(400, 'Invalid proof');

      this.nullifiers.add(proof.nullifier);
      option.votes += 1; // what the chain listener and vote-sync consumer do once the tx confirms
      return { status: 201, data: { transactionHash: '0x' + randomBytes(32).toString('hex') } };
    });
  }
}
