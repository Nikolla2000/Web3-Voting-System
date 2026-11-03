import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Covers JwtAuthGuard — the one guard that actually gates every request in
 * the system (registered globally via APP_GUARD in api-gateway.module.ts).
 * No real Passport strategy is exercised here: `super.canActivate` (the
 * passport-jwt verification itself) is stubbed, since that's framework
 * behavior, not this guard's own logic. What's under test is this guard's
 * own decisions — honoring @Public() and translating a failed/missing user
 * into a specific 401.
 */
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(reflector as unknown as Reflector);
  });

  function makeContext(): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  describe('canActivate', () => {
    it('lets a @Public() route through without invoking the jwt strategy', () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const superCanActivate = jest.spyOn(
        Object.getPrototypeOf(JwtAuthGuard.prototype),
        'canActivate',
      );

      const result = guard.canActivate(makeContext());

      expect(result).toBe(true);
      expect(superCanActivate).not.toHaveBeenCalled();
    });

    it('delegates to the passport jwt strategy for a non-public route', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const superCanActivate = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const context = makeContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(superCanActivate).toHaveBeenCalledWith(context);
    });
  });

  describe('handleRequest', () => {
    it('returns the authenticated user on success', () => {
      const user = { id: 'user-1' };

      expect(guard.handleRequest(null as unknown as Error, user)).toBe(user);
    });

    it('rethrows whatever error the strategy raised', () => {
      const err = new Error('token verification exploded');

      expect(() => guard.handleRequest(err, null)).toThrow(err);
    });

    it('raises a 401 when the strategy reports no error but also no user (e.g. expired token)', () => {
      expect(() => guard.handleRequest(null as unknown as Error, null)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
