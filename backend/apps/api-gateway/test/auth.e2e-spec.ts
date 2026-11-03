import { ChildProcess, execSync, spawn } from 'child_process';
import * as net from 'net';
import * as path from 'path';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
// `import * as` gives the CJS namespace wrapper, not the callable export
// these packages actually need (same reason main.ts uses this form for
// cookie-parser).
// eslint-disable-next-line @typescript-eslint/no-require-imports
import cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require('supertest');
import appConfig from '../src/config/app.config';
import jwtConfig from '../src/config/jwt.config';
import googleConfig from '../src/config/google.config';

/**
 * End-to-end auth flow against the REAL gateway HTTP pipeline (guard,
 * exception filter, response envelope, validation pipe, cookies) and a REAL
 * `identity` instance + ephemeral Postgres — nothing here is mocked except
 * RabbitMQ (left unreachable on purpose: `RabbitMQPublisherService.publish`
 * is a documented no-op without a live channel, so `register()` publishing
 * USER_REGISTERED into the void is harmless) and Google OAuth (not part of
 * this flow).
 *
 * Deliberately scoped to the gateway's own AuthModule rather than the full
 * ApiGatewayModule — polls/blockchain/ai/the Redis-backed throttler are
 * separate concerns already covered at the unit/integration level, and
 * pulling them in here would mean standing up gRPC services, Redis, and R2
 * for infrastructure this suite never exercises.
 *
 * Requires Docker (for the ephemeral Postgres) and a webpack build of
 * `identity` (so its Prisma client's `import.meta.url` — unparseable by
 * ts-jest's CommonJS transform — is handled the same way webpack already
 * handles it for the real dev/prod build, rather than needing identity's
 * source loaded into this Jest process at all). Run via
 * `npm run test:e2e:gateway`; excluded from the default `npm test` run.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access --
 * supertest's Response#body is typed `any`, so every `res.body.data.*` access here is
 * inherently `any` — not a production typing issue to fix.
 */

const BACKEND_ROOT = path.resolve(__dirname, '../../..');
const IDENTITY_TEST_PORT = 3091;
const JWT_ACCESS_SECRET = 'e2e-test-access-secret';
const JWT_REFRESH_SECRET = 'e2e-test-refresh-secret';

function waitForPort(
  host: string,
  port: number,
  timeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect(port, host);
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(
            new Error(
              `Timed out waiting for ${host}:${port} to accept connections`,
            ),
          );
        } else {
          setTimeout(attempt, 500);
        }
      });
    };
    attempt();
  });
}

describe('API Gateway — auth flow (e2e)', () => {
  let postgres: StartedTestContainer;
  let identityProcess: ChildProcess;
  let identityLogs = '';
  let app: INestApplication;

  beforeAll(async () => {
    postgres = await new GenericContainer('postgres:16-alpine')
      .withEnvironment({
        POSTGRES_USER: 'identity_test',
        POSTGRES_PASSWORD: 'identity_test',
        POSTGRES_DB: 'identity_test_db',
      })
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forLogMessage(/database system is ready to accept connections/, 2),
      )
      .start();

    const databaseUrl = `postgresql://identity_test:identity_test@${postgres.getHost()}:${postgres.getMappedPort(5432)}/identity_test_db`;

    const identityEnv = {
      ...process.env,
      // identity's Joi schema only allows development|production.
      NODE_ENV: 'development',
      IDENTITY_SERVICE_PORT: String(IDENTITY_TEST_PORT),
      DATABASE_URL: databaseUrl,
      JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET,
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      // Deliberately unreachable — RabbitMQConnectionService retries forever
      // in the background without blocking startup, and publish() is a
      // documented no-op when the channel isn't ready.
      RABBITMQ_URL: 'amqp://127.0.0.1:59999',
      R2_BUCKET_NAME: 'test-bucket',
      R2_ACCESS_KEY_ID: 'test-key',
      R2_SECRET_ACCESS_KEY: 'test-secret',
      R2_ENDPOINT: 'https://fake-r2.invalid',
      R2_PUBLIC_URL: 'https://fake-r2-public.invalid',
    };

    execSync('npx prisma migrate deploy', {
      cwd: path.join(BACKEND_ROOT, 'apps/identity'),
      env: identityEnv,
      stdio: 'inherit',
    });

    // `nest build` (webpack) is what correctly handles the generated Prisma
    // client's `import.meta.url` — see the file-level comment. This runs the
    // real production build pipeline, not a test-only substitute.
    execSync('npx nest build identity', {
      cwd: BACKEND_ROOT,
      stdio: 'inherit',
    });

    identityProcess = spawn('node', ['dist/apps/identity/main.js'], {
      cwd: BACKEND_ROOT,
      env: identityEnv,
    });
    identityProcess.stdout?.on(
      'data',
      (d: Buffer) => (identityLogs += d.toString()),
    );
    identityProcess.stderr?.on(
      'data',
      (d: Buffer) => (identityLogs += d.toString()),
    );

    try {
      await waitForPort('127.0.0.1', IDENTITY_TEST_PORT, 30000);
    } catch {
      throw new Error(
        `identity never became ready on port ${IDENTITY_TEST_PORT}.\n--- identity logs ---\n${identityLogs}`,
      );
    }

    // AuthModule's ClientsModule.register([...]) reads
    // IDENTITY_SERVICE_HOST/PORT as a plain `process.env` lookup evaluated
    // once, when the module file is first loaded — not lazily at Nest's
    // compile phase. A static top-level `import` of AuthModule at the top
    // of this file would already have run (baking in the wrong port)
    // before this code executes, so it's imported dynamically, after these
    // env vars are set.
    process.env.IDENTITY_SERVICE_HOST = '127.0.0.1';
    process.env.IDENTITY_SERVICE_PORT = String(IDENTITY_TEST_PORT);
    process.env.JWT_ACCESS_SECRET = JWT_ACCESS_SECRET;
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/api/auth/google/callback';
    process.env.FRONTEND_URL = 'http://localhost:5000';
    // Gateway's own Joi schema (not loaded here, see below) also only
    // allows development|production — kept consistent anyway.
    process.env.NODE_ENV = 'development';

    // Plain `require()`, not `import()` — this tsconfig's `nodenext` module
    // mode leaves dynamic `import()` as a native ESM call, which Jest's
    // CommonJS test environment can't execute without
    // --experimental-vm-modules. `require()` is untouched by TS and runs
    // immediately, which is exactly what's needed here anyway (loading
    // AuthModule only after the env vars above are set).
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { AuthModule } =
      require('../src/auth/auth.module') as typeof import('../src/auth/auth.module');
    const { JwtAuthGuard } =
      require('../src/auth/guards/jwt-auth.guard') as typeof import('../src/auth/guards/jwt-auth.guard');
    const { GlobalExceptionFilter } =
      require('../src/common/filters/global-exception.filter') as typeof import('../src/common/filters/global-exception.filter');
    const { TransformInterceptor } =
      require('../src/common/interceptors/transform.interceptor') as typeof import('../src/common/interceptors/transform.interceptor');
    const { LoggingInterceptor } =
      require('../src/common/interceptors/logging.interceptor') as typeof import('../src/common/interceptors/logging.interceptor');
    /* eslint-enable @typescript-eslint/no-require-imports */

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [appConfig, jwtConfig, googleConfig],
        }),
        AuthModule,
      ],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_FILTER, useClass: GlobalExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.use(cookieParser());
    await app.init();
  }, 120000);

  afterAll(async () => {
    await app?.close();
    identityProcess?.kill();
    await postgres?.stop();
  }, 30000);

  // Each test registers its own uniquely-emailed user rather than sharing
  // state/order with other tests, per the "isolated, deterministic, order-
  // independent" testing guideline.
  let userCounter = 0;
  function uniqueCredentials() {
    userCounter += 1;
    // RegisterDto caps username at 20 chars — base36 timestamp keeps this short.
    const suffix = `${Date.now().toString(36)}${userCounter}`;
    return {
      username: `e2e_${suffix}`,
      email: `e2e_${suffix}@example.com`,
      password: 'SomePass123!',
    };
  }

  function refreshCookieFrom(res: request.Response): string {
    const setCookie = res.headers['set-cookie'] as unknown as string[];
    const cookie = setCookie.find((c) => c.startsWith('refreshToken='));
    if (!cookie) throw new Error('No refreshToken cookie in response');
    return cookie.split(';')[0];
  }

  async function registerUser() {
    const credentials = uniqueCredentials();
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(credentials);
    return {
      credentials,
      accessToken: res.body.data.accessToken as string,
      refreshCookie: refreshCookieFrom(res),
      user: res.body.data.user,
    };
  }

  it('registers a new user, returning an accessToken and setting an httpOnly refresh cookie', async () => {
    const credentials = uniqueCredentials();
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({
      username: credentials.username,
      email: credentials.email,
    });
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(typeof res.body.data.accessToken).toBe('string');

    const setCookie = res.headers['set-cookie'] as unknown as string[];
    expect(setCookie.some((c) => c.startsWith('refreshToken='))).toBe(true);
    expect(setCookie.some((c) => /HttpOnly/i.test(c))).toBe(true);
    expect(setCookie.some((c) => /Path=\//i.test(c))).toBe(true);
  });

  it('rejects a duplicate registration for the same email', async () => {
    const { credentials } = await registerUser();

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(credentials);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('logs in with correct credentials', async () => {
    const { credentials } = await registerUser();

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(typeof res.body.data.accessToken).toBe('string');
  });

  it('rejects login with the wrong password', async () => {
    const { credentials } = await registerUser();

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'TotallyWrongPass1' });

    expect(res.status).toBe(401);
  });

  it('rejects an unauthenticated request to a protected route', async () => {
    const res = await request(app.getHttpServer()).get('/api/users/me');

    expect(res.status).toBe(401);
  });

  it('returns the current user profile when a valid access token is presented', async () => {
    const { accessToken, user } = await registerUser();

    const res = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
  });

  it('rejects a request with a malformed Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer not-a-real-jwt');

    expect(res.status).toBe(401);
  });

  it('rotates the refresh token: the old one is revoked and can no longer be reused', async () => {
    const { refreshCookie } = await registerUser();

    // JWT `iat` has second-level granularity — without this gap, a token
    // minted in the same second as registration's would be byte-identical,
    // making the "reuse the old one" check below meaningless (it'd just be
    // reusing what is, by coincidence, also the current valid token).
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.accessToken).toBe('string');
    const newCookie = refreshCookieFrom(res);
    expect(newCookie).not.toBe(refreshCookie);

    const reuseRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(reuseRes.status).toBe(401);
  });

  it('rejects a refresh request with no cookie at all', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/refresh');

    expect(res.status).toBe(401);
  });

  it('rejects a refresh request with a tampered cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=not-a-real-jwt');

    expect(res.status).toBe(401);
  });

  it('logout invalidates the refresh token — a second refresh with the same cookie then fails', async () => {
    const { accessToken, refreshCookie } = await registerUser();

    const logoutRes = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie);
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);
    expect(refreshRes.status).toBe(401);
  });
});
