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

/** Issues on one option row, keyed by index: { 2: ['Each option must be different'] }. */
function optionMessages(values: unknown): Record<number, string[]> {
  const result = createPollSchema.safeParse(values);
  const byIndex: Record<number, string[]> = {};
  if (result.success) return byIndex;
  for (const issue of result.error.issues) {
    if (issue.path[0] === 'options' && typeof issue.path[1] === 'number') {
      (byIndex[issue.path[1]] ??= []).push(issue.message);
    }
  }
  return byIndex;
}

function messagesFor(values: unknown, field: string): string[] {
  const result = createPollSchema.safeParse(values);
  return result.success
    ? []
    : result.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
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
    it('accepts a start date up to 15 minutes in the past, so "start now" survives filling in the form', () => {
      expect(messagesFor({ ...validPoll(), startsAt: at(-15 * 60_000) }, 'startsAt')).toEqual([]);
    });

    it('rejects a start date further in the past than that', () => {
      expect(messagesFor({ ...validPoll(), startsAt: at(-15 * 60_000 - 1) }, 'startsAt')).toEqual([
        "Start date can't be in the past",
      ]);
      expect(messagesFor({ ...validPoll(), startsAt: at(-30 * 24 * HOUR) }, 'startsAt')).toEqual([
        "Start date can't be in the past",
      ]);
    });

    it('rejects an end date before the start date', () => {
      const messages = messagesFor(
        { ...validPoll(), startsAt: at(72 * HOUR), endsAt: at(48 * HOUR) },
        'endsAt',
      );
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
      expect(
        messagesFor({ ...validPoll(), startsAt: at(168 * HOUR), endsAt: at(170 * HOUR) }, 'endsAt'),
      ).toEqual([]);
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
      expect(
        messagesFor({ ...validPoll(), image: image('image/png', IMAGE_MAX_SIZE_BYTES) }, 'image'),
      ).toEqual([]);
      expect(
        messagesFor(
          { ...validPoll(), image: image('image/png', IMAGE_MAX_SIZE_BYTES + 1) },
          'image',
        ),
      ).toEqual(['Image must be under 5MB.']);
    });

    it('requires an image to be chosen', () => {
      expect(messagesFor({ ...validPoll(), image: undefined }, 'image')).toEqual([
        'Please choose a cover image',
      ]);
    });
  });

  describe('options', () => {
    it('requires at least two options', () => {
      expect(messagesFor({ ...validPoll(), options: [{ value: 'Only one' }] }, 'options')).toEqual([
        'At least 2 options are required',
      ]);
    });

    it('rejects a whitespace-only option as blank', () => {
      expect(
        optionMessages({ ...validPoll(), options: [{ value: 'Lisbon' }, { value: '   ' }] }),
      ).toEqual({
        1: ['Option text is required'],
      });
    });

    it('rejects duplicate options, ignoring case and surrounding spaces, flagging each repeat', () => {
      const options = [
        { value: 'Lisbon' },
        { value: 'Prague' },
        { value: ' lisbon ' },
        { value: 'LISBON' },
      ];
      expect(optionMessages({ ...validPoll(), options })).toEqual({
        2: ['Each option must be different'],
        3: ['Each option must be different'],
      });
    });

    it('does not report two blank options as duplicates of each other', () => {
      expect(optionMessages({ ...validPoll(), options: [{ value: '' }, { value: ' ' }] })).toEqual({
        0: ['Option text is required'],
        1: ['Option text is required'],
      });
    });

    it('submits options, title and description trimmed', () => {
      const result = createPollSchema.parse({
        ...validPoll(),
        title: '  Best city for a weekend trip?  ',
        description: '\tPick the city you would most like to visit.\n',
        options: [{ value: ' Lisbon ' }, { value: 'Prague  ' }],
      });
      expect(result.title).toBe('Best city for a weekend trip?');
      expect(result.description).toBe('Pick the city you would most like to visit.');
      expect(result.options).toEqual([{ value: 'Lisbon' }, { value: 'Prague' }]);
    });

    it('does not let padding satisfy the title minimum', () => {
      expect(messagesFor({ ...validPoll(), title: '  ab   ' }, 'title')).toEqual([
        'Title must be at least 5 characters',
      ]);
    });

    it('rejects a blank option', () => {
      expect(
        messagesFor({ ...validPoll(), options: [{ value: 'Lisbon' }, { value: '' }] }, 'options'),
      ).toEqual(['Option text is required']);
    });
  });

  it('rejects an unknown category', () => {
    expect(messagesFor({ ...validPoll(), category: 'gaming' }, 'category')).toEqual([
      'Select a category',
    ]);
  });
});
