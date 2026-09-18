import { z } from 'zod';

export const POLL_CATEGORY_VALUES = ['governance', 'treasury', 'technical', 'community'] as const;

export const MIN_POLL_END_LEAD_HOURS = 24;

export const createPollSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(160, 'Title must be under 160 characters'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must be under 2000 characters'),
    imageUrl: z.string().min(1, 'Image URL is required').url('Enter a valid URL'),
    category: z.enum(POLL_CATEGORY_VALUES, { message: 'Select a category' }),
    startsAt: z.string().min(1, 'Start date is required'),
    endsAt: z.string().min(1, 'End date is required'),
    options: z
      .array(z.object({ value: z.string().min(1, 'Option text is required') }))
      .min(2, 'At least 2 options are required'),
  })
  .refine((data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(), {
    message: 'End date must be after the start date',
    path: ['endsAt'],
  })
  .refine((data) => new Date(data.endsAt).getTime() >= Date.now() + MIN_POLL_END_LEAD_HOURS * 60 * 60 * 1000, {
    message: 'End date must be at least a day from now',
    path: ['endsAt'],
  });

export type CreatePollFormValues = z.infer<typeof createPollSchema>;
