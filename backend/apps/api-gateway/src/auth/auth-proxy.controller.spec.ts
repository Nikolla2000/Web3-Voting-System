import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuthProxyController } from './auth-proxy.controller';
import { AuthProxyService } from './auth-proxy.service';
import { AUTH_PATTERNS, USERS_PATTERNS } from '@app/shared';
import type { JwtPayload } from './strategies/jwt.strategy';

/**
 * Covers AuthProxyController's own logic — everything beyond pure
 * forwarding. Specifically: the refresh-token cookie options (httpOnly/
 * secure/sameSite, driven by NODE_ENV — this is the concrete implementation
 * of CLAUDE.md's "refresh token as an http-only cookie" decision) and
 * refresh()'s own JWT verification before it ever calls identity. The
 * downstream IDENTITY_SERVICE TCP client is mocked — this is not an e2e
 * test of the real auth flow.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access --
 * jest.Mock's `.mock.calls` is typed `any[][]`, so indexing into it to
 * inspect the exact cookie options passed is inherently `any` here — not a
 * production typing issue to fix.
 */
describe('AuthProxyController', () => {
  let controller: AuthProxyController;
  let authClient: { send: jest.Mock };
  let jwtService: { verifyAsync: jest.Mock };
  let configValues: Record<string, string>;

  const user: JwtPayload = {
    sub: 'user-1',
    email: 'voter@example.com',
    username: 'voter',
    role: 'USER',
  };

  beforeEach(async () => {
    authClient = { send: jest.fn() };
    jwtService = { verifyAsync: jest.fn() };
    configValues = { 'app.nodeEnv': 'development' };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthProxyController],
      providers: [
        {
          provide: ConfigService,
          useValue: { get: (key: string) => configValues[key] },
        },
        { provide: AuthProxyService, useValue: {} },
        { provide: JwtService, useValue: jwtService },
        { provide: 'IDENTITY_SERVICE', useValue: authClient },
      ],
    }).compile();

    controller = module.get(AuthProxyController);
  });

  function makeRes() {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
  }

  const authResponse = {
    user: { id: 'user-1', email: 'voter@example.com' },
    tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
  };

  describe('cookie security attributes', () => {
    it('sets the refresh cookie as httpOnly, non-secure, lax in development', async () => {
      authClient.send.mockReturnValue(of(authResponse));
      const res = makeRes();

      await controller.login({ email: 'x', password: 'y' }, res as any);

      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    });

    it('sets the refresh cookie as secure + strict in production', async () => {
      configValues['app.nodeEnv'] = 'production';
      authClient.send.mockReturnValue(of(authResponse));
      const res = makeRes();

      await controller.login({ email: 'x', password: 'y' }, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ secure: true, sameSite: 'strict' }),
      );
    });

    // setRefreshCookie never passes a `path`, so Express/the browser default
    // it to the *directory* of whichever endpoint set it (e.g. "/auth" for
    // a login from "/auth/login") per RFC 6265 — not "/". clearRefreshCookie
    // explicitly passes path: '/'. A Set-Cookie clear with a different path
    // than the cookie was originally scoped to does not delete it in a real
    // browser — it's treated as an unrelated cookie. Documenting this
    // mismatch as a characterization test; see the session summary for this
    // flagged as a likely real bug (logout not actually clearing the
    // refresh cookie), not a deliberate design choice to preserve.
    it('does not set a matching path on the cookie it later tries to clear with path "/"', async () => {
      authClient.send.mockReturnValue(of(authResponse));
      const loginRes = makeRes();
      await controller.login({ email: 'x', password: 'y' }, loginRes as any);
      const cookieOptions = loginRes.cookie.mock.calls[0][2];

      authClient.send.mockReturnValue(of({ message: 'ok' }));
      const logoutRes = makeRes();
      await controller.logoutAll(user, logoutRes as any);
      const clearOptions = logoutRes.clearCookie.mock.calls[0][1];

      expect(cookieOptions.path).toBeUndefined();
      expect(clearOptions.path).toBe('/');
    });
  });

  describe('register / login', () => {
    it('forwards the dto to identity and returns the user + accessToken without the refresh token', async () => {
      authClient.send.mockReturnValue(of(authResponse));
      const res = makeRes();

      const result = await controller.register(
        { email: 'x', username: 'y', password: 'z' },
        res as any,
      );

      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: AUTH_PATTERNS.REGISTER },
        { email: 'x', username: 'y', password: 'z' },
      );
      expect(result).toEqual({
        user: authResponse.user,
        accessToken: 'access-token',
      });
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('refresh', () => {
    it('rejects with 401 when the refresh cookie is missing entirely', async () => {
      const req = { cookies: {} };

      await expect(
        controller.refresh(req as any, makeRes() as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(authClient.send).not.toHaveBeenCalled();
    });

    it('rejects with 401 when the cookie fails JWT verification, without calling identity', async () => {
      const req = { cookies: { refreshToken: 'tampered' } };
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(
        controller.refresh(req as any, makeRes() as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(authClient.send).not.toHaveBeenCalled();
    });

    it('forwards to identity only once the refresh token verifies, then rotates the cookie', async () => {
      const req = { cookies: { refreshToken: 'valid-refresh-token' } };
      jwtService.verifyAsync.mockResolvedValue(user);
      authClient.send.mockReturnValue(
        of({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      );
      const res = makeRes();

      const result = await controller.refresh(req as any, res as any);

      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: AUTH_PATTERNS.REFRESH },
        { userId: user.sub, refreshToken: 'valid-refresh-token' },
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh',
        expect.anything(),
      );
      expect(result).toEqual({ accessToken: 'new-access' });
    });
  });

  describe('logout / logoutAll', () => {
    it('logout forwards the userId + cookie token to identity and clears the cookie', async () => {
      authClient.send.mockReturnValue(
        of({ message: 'Logged out successfully' }),
      );
      const req = { cookies: { refreshToken: 'refresh-token' } };
      const res = makeRes();

      await controller.logout(user, req as any, res as any);

      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: AUTH_PATTERNS.LOGOUT },
        { userId: user.sub, refreshToken: 'refresh-token' },
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({ path: '/' }),
      );
    });

    it('logoutAll forwards just the userId and clears the cookie', async () => {
      authClient.send.mockReturnValue(
        of({ message: 'Logged out from all devices' }),
      );
      const res = makeRes();

      await controller.logoutAll(user, res as any);

      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: AUTH_PATTERNS.LOGOUT_ALL },
        { userId: user.sub },
      );
      expect(res.clearCookie).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it("forwards the current user's id to identity", async () => {
      authClient.send.mockReturnValue(of({ id: user.sub }));

      await controller.getMe(user);

      expect(authClient.send).toHaveBeenCalledWith(
        { cmd: USERS_PATTERNS.GET_ME },
        { userId: user.sub },
      );
    });
  });

  it('propagates a downstream identity rejection instead of swallowing it', async () => {
    authClient.send.mockReturnValue(
      throwError(() => new Error('identity unreachable')),
    );

    await expect(
      controller.register(
        { email: 'x', username: 'y', password: 'z' } as any,
        makeRes() as any,
      ),
    ).rejects.toThrow('identity unreachable');
  });
});
