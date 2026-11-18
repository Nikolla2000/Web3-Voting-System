import { z } from 'zod';
import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE_BYTES } from '@/lib/validation/image-upload';

export const POLL_CATEGORY_VALUES = [
  'sports',
  'travel',
  'entertainment',
  'lifestyle',
  'tech_science',
  'society',
  'finance',
  'politics',
  'education',
  'other',
] as const;

export const MIN_POLL_END_LEAD_HOURS = 24;

/**
 * How far in the past a start date may be. "Now" is a valid start, but the datetime-local input
 * only has minute precision and the user may pick it, then spend a few minutes on the rest of the
 * form, so an exact `>= Date.now()` would reject a poll the user meant to start immediately.
 */
export const START_DATE_GRACE_MINUTES = 15;

/** Case- and whitespace-insensitive, so "Yes" and " yes " count as the same option. */
const normalizeOption = (value: string) => value.trim().toLowerCase();

export const createPollSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters')
      .max(160, 'Title must be under 160 characters'),
    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must be under 2000 characters'),
    image: z
      .instanceof(File, { message: 'Please choose a cover image' })
      .refine(
        (file) => IMAGE_ALLOWED_TYPES.includes(file.type),
        'Please choose a JPG, PNG or WEBP image.',
      )
      .refine((file) => file.size <= IMAGE_MAX_SIZE_BYTES, 'Image must be under 5MB.'),
    category: z.enum(POLL_CATEGORY_VALUES, { message: 'Select a category' }),
    startsAt: z.string().min(1, 'Start date is required'),
    endsAt: z.string().min(1, 'End date is required'),
    options: z
      .array(z.object({ value: z.string().trim().min(1, 'Option text is required') }))
      .min(2, 'At least 2 options are required')
      .superRefine((options, ctx) => {
        // Flag every repeat after the first, on the option itself so the error shows on that row.
        const seen = new Set<string>();
        options.forEach((option, index) => {
          const key = normalizeOption(option.value);
          if (!key) return;
          if (seen.has(key)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Each option must be different',
              path: [index, 'value'],
            });
          }
          seen.add(key);
        });
      }),
  })
  .refine(
    (data) =>
      new Date(data.startsAt).getTime() >= Date.now() - START_DATE_GRACE_MINUTES * 60 * 1000,
    {
      message: "Start date can't be in the past",
      path: ['startsAt'],
    },
  )
  .refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
    message: 'End date must be after the start date',
    path: ['endsAt'],
  })
  .refine(
    (data) =>
      new Date(data.endsAt).getTime() >= Date.now() + MIN_POLL_END_LEAD_HOURS * 60 * 60 * 1000,
    {
      message: 'End date must be at least 24 hours from now',
      path: ['endsAt'],
    },
  );

export type CreatePollFormValues = z.infer<typeof createPollSchema>;
