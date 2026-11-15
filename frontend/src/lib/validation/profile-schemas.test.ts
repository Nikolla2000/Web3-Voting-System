import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  createDeactivateAccountSchema,
  DEACTIVATE_CONFIRMATION_PHRASE,
  setPasswordSchema,
} from '@/lib/validation/profile-schemas';

describe('changePasswordSchema', () => {
  const valid = { currentPassword: 'old', newPassword: 'NewSecret1', confirmNewPassword: 'NewSecret1' };

  it('accepts a strong, confirmed new password', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('enforces the same strength rules as registration on the new password', () => {
    const result = changePasswordSchema.safeParse({ ...valid, newPassword: 'weakpass', confirmNewPassword: 'weakpass' });
    expect(result.error?.issues.map((i) => i.path[0])).toEqual(['newPassword']);
  });

  it('reports a mismatch on confirmNewPassword', () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmNewPassword: 'NewSecret2' });
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['confirmNewPassword'], message: 'Passwords do not match' }),
    ]);
  });
});

describe('setPasswordSchema (Google-only accounts)', () => {
  it('does not ask for a current password', () => {
    expect(setPasswordSchema.safeParse({ newPassword: 'NewSecret1', confirmNewPassword: 'NewSecret1' }).success).toBe(
      true,
    );
  });
});

describe('createDeactivateAccountSchema', () => {
  it('requires the exact confirmation phrase', () => {
    const schema = createDeactivateAccountSchema(false);
    expect(schema.safeParse({ confirmText: DEACTIVATE_CONFIRMATION_PHRASE }).success).toBe(true);
    for (const confirmText of ['deactivate my account', `${DEACTIVATE_CONFIRMATION_PHRASE} `, '']) {
      expect(schema.safeParse({ confirmText }).success).toBe(false);
    }
  });

  it('requires a password only for accounts that have one', () => {
    const withPassword = createDeactivateAccountSchema(true);
    expect(withPassword.safeParse({ confirmText: DEACTIVATE_CONFIRMATION_PHRASE }).error?.issues[0]?.path).toEqual([
      'password',
    ]);
    expect(withPassword.safeParse({ password: 'x', confirmText: DEACTIVATE_CONFIRMATION_PHRASE }).success).toBe(true);

    const googleOnly = createDeactivateAccountSchema(false);
    expect(googleOnly.safeParse({ confirmText: DEACTIVATE_CONFIRMATION_PHRASE }).success).toBe(true);
  });
});
