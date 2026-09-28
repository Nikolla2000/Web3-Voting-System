import { z } from 'zod';

export const profileInfoSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be under 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  avatar: z.union([z.literal(''), z.string().trim().url('Enter a valid image URL')]),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoSchema>;

const newPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(32, 'Password must be under 32 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter and one number',
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: newPasswordField,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const setPasswordSchema = z
  .object({
    newPassword: newPasswordField,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

// Typed as `string`, not a literal — a literal here makes TS infer `.refine`
// below as a narrowing type predicate, which breaks zodResolver's generics.
export const DEACTIVATE_CONFIRMATION_PHRASE: string = 'Deactivate my account';

export function createDeactivateAccountSchema(requirePassword: boolean) {
  return z.object({
    password: requirePassword
      ? z.string().min(1, 'Password is required')
      : z.string().optional(),
    confirmText: z
      .string()
      .refine((value) => value === DEACTIVATE_CONFIRMATION_PHRASE, {
        message: `Type "${DEACTIVATE_CONFIRMATION_PHRASE}" exactly to continue`,
      }),
  });
}

export type DeactivateAccountFormValues = z.infer<ReturnType<typeof createDeactivateAccountSchema>>;
