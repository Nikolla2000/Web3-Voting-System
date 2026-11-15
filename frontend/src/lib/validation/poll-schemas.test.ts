import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPollSchema } from '@/lib/validation/poll-schemas';
import { IMAGE_MAX_SIZE_BYTES } from '@/lib/validation/image-upload';

const NOW = new Date('2026-06-01T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs).toISOString();

function image(type = 'image/png', size = 1024) {
  return new File([new Uint8Array(size)], 'cover', { type });
}

function validPoll() {
  return {
    title: 'Best city for a weekend trip?',
    description: 'Pick the city you would most like to visit.',
    image: image(),
    category: 'travel' as const,
    startsAt: at(0),
    endsAt: at(48 * HOUR),
    options: [{ value: 'Lisbon' }, { value: 'Prague' }],
  };
}

function messagesFor(values: unknown, field: string): string[] {
  const result = createPollSchema.safeParse(values);
  return result.success ? [] : result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
}

// The 24h-lead rule reads Date.now(), so pin the clock to keep these deterministic.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe('createPollSchema', () => {
  it('accepts a valid poll', () => {
    expect(createPollSchema.safeParse(validPoll()).success).toBe(true);
  });

  describe('dates', () => {
    it('rejects an end date before the start date', () => {
      const messages = messagesFor({ ...validPoll(), startsAt: at(72 * HOUR), endsAt: at(48 * HOUR) }, 'endsAt');
      expect(messages).toContain('End date must be after the start date');
    });

    it('requires the poll to end at least 24 hours from now — exactly 24h is allowed', () => {
      expect(messagesFor({ ...validPoll(), endsAt: at(24 * HOUR) }, 'endsAt')).toEqual([]);
      expect(messagesFor({ ...validPoll(), endsAt: at(24 * HOUR - 60_000) }, 'endsAt')).toEqual([
        'End date must be at least 24 hours from now',
      ]);
    });

    it('measures the 24h lead from now, not from the start date', () => {
      // Starts in a week, ends 2h after starting: well past now + 24h, so valid.
      expect(messagesFor({ ...validPoll(), startsAt: at(168 * HOUR), endsAt: at(170 * HOUR) }, 'endsAt')).toEqual([]);
    });
  });

  describe('cover image', () => {
    it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', (type) => {
      expect(messagesFor({ ...validPoll(), image: image(type) }, 'image')).toEqual([]);
    });

    it('rejects other file types', () => {
      expect(messagesFor({ ...validPoll(), image: image('image/gif') }, 'image')).toEqual([
        'Please choose a JPG, PNG or WEBP image.',
      ]);
    });

    it('accepts exactly 5MB and rejects one byte more', () => {
      expect(messagesFor({ ...validPoll(), image: image('image/png', IMAGE_MAX_SIZE_BYTES) }, 'image')).toEqual([]);
      expect(messagesFor({ ...validPoll(), image: image('image/png', IMAGE_MAX_SIZE_BYTES + 1) }, 'image')).toEqual([
        'Image must be under 5MB.',
      ]);
    });

    it('requires an image to be chosen', () => {
      expect(messagesFor({ ...validPoll(), image: undefined }, 'image')).toEqual(['Please choose a cover image']);
    });
  });

  describe('options', () => {
    it('requires at least two options', () => {
      expect(messagesFor({ ...validPoll(), options: [{ value: 'Only one' }] }, 'options')).toEqual([
        'At least 2 options are required',
      ]);
    });

    it('rejects a blank option', () => {
      expect(messagesFor({ ...validPoll(), options: [{ value: 'Lisbon' }, { value: '' }] }, 'options')).toEqual([
        'Option text is required',
      ]);
    });
  });

  it('rejects an unknown category', () => {
    expect(messagesFor({ ...validPoll(), category: 'gaming' }, 'category')).toEqual(['Select a category']);
  });
});
