import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  registerSchema,
  type RegisterFormValues,
} from '@/lib/validation/auth-schemas';

const validRegistration: RegisterFormValues = {
  username: 'alice_01',
  email: 'alice@example.com',
  password: 'Secret123',
  confirmPassword: 'Secret123',
};

/** First issue message for a given field, or undefined if that field is valid. */
function errorFor(values: unknown, field: string): string | undefined {
  const result = registerSchema.safeParse(values);
  return result.success ? undefined : result.error.issues.find((i) => i.path[0] === field)?.message;
}

describe('loginSchema', () => {
  it('accepts an email + any non-empty password (strength is only enforced at registration)', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('distinguishes a missing email from a malformed one', () => {
    const missing = loginSchema.safeParse({ email: '', password: 'x' });
    const malformed = loginSchema.safeParse({ email: 'nope', password: 'x' });
    expect(missing.error?.issues[0]?.message).toBe('Email is required');
    expect(malformed.error?.issues[0]?.message).toBe('Enter a valid email address');
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it.each([
    ['ab', 'Username must be at least 3 characters'],
    ['a'.repeat(21), 'Username must be under 20 characters'],
    ['alice smith', 'Username can only contain letters, numbers and underscores'],
    ['alice-01', 'Username can only contain letters, numbers and underscores'],
  ])('rejects username %j', (username, message) => {
    expect(errorFor({ ...validRegistration, username }, 'username')).toBe(message);
  });

  it('accepts the username length boundaries (3 and 20)', () => {
    expect(errorFor({ ...validRegistration, username: 'abc' }, 'username')).toBeUndefined();
    expect(
      errorFor({ ...validRegistration, username: 'a'.repeat(20) }, 'username'),
    ).toBeUndefined();
  });

  it.each([
    ['Short1', 'Password must be at least 8 characters'],
    [`Aa1${'x'.repeat(30)}`, 'Password must be under 32 characters'],
    [
      'alllower1',
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
    ],
    [
      'ALLUPPER1',
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
    ],
    [
      'NoDigitsHere',
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
    ],
  ])('rejects weak password %j', (password, message) => {
    expect(
      errorFor({ ...validRegistration, password, confirmPassword: password }, 'password'),
    ).toBe(message);
  });

  it('reports a confirmation mismatch on confirmPassword (where the form shows it)', () => {
    expect(
      errorFor({ ...validRegistration, confirmPassword: 'Secret124' }, 'confirmPassword'),
    ).toBe('Passwords do not match');
  });
});
