import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePollDto, PollCategoryDto } from './create-poll.dto';

const NOW = new Date('2026-06-01T12:00:00Z');
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const at = (offsetMs: number) =>
  new Date(NOW.getTime() + offsetMs).toISOString();

function validPoll(): Record<string, unknown> {
  return {
    title: 'Best city for a weekend trip?',
    description: 'Pick the city you would most like to visit.',
    imageUrl: 'https://cdn.example.com/cover.png',
    category: PollCategoryDto.TRAVEL,
    startsAt: at(HOUR),
    endsAt: at(48 * HOUR),
    options: ['Lisbon', 'Prague'],
  };
}

/** What the gateway's ValidationPipe does: transform (incl. @Transform), then validate. */
async function check(overrides: Record<string, unknown> = {}) {
  const dto = plainToInstance(CreatePollDto, { ...validPoll(), ...overrides });
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const byField = Object.fromEntries(
    errors.map((e) => [e.property, Object.values(e.constraints ?? {})]),
  );
  return { dto, byField };
}

describe('CreatePollDto', () => {
  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(NOW);
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('accepts a valid poll', async () => {
    expect((await check()).byField).toEqual({});
  });

  describe('startsAt', () => {
    it('accepts "now", and up to 15 minutes in the past', async () => {
      expect((await check({ startsAt: at(0) })).byField).toEqual({});
      expect((await check({ startsAt: at(-15 * MINUTE) })).byField).toEqual({});
    });

    it('rejects a start date further in the past', async () => {
      expect(
        (await check({ startsAt: at(-15 * MINUTE - 1000) })).byField,
      ).toEqual({
        startsAt: ['startsAt must not be in the past'],
      });
      expect(
        (await check({ startsAt: at(-30 * 24 * HOUR) })).byField.startsAt,
      ).toContain('startsAt must not be in the past');
    });
  });

  describe('endsAt', () => {
    it('must be after startsAt, even when both are far enough in the future', async () => {
      const { byField } = await check({
        startsAt: at(72 * HOUR),
        endsAt: at(48 * HOUR),
      });
      expect(byField).toEqual({ endsAt: ['endsAt must be after startsAt'] });
    });

    it('rejects an end equal to the start', async () => {
      const { byField } = await check({
        startsAt: at(48 * HOUR),
        endsAt: at(48 * HOUR),
      });
      expect(byField.endsAt).toEqual(['endsAt must be after startsAt']);
    });

    it('leaves an unparseable startsAt to its own validator rather than double-reporting', async () => {
      const { byField } = await check({ startsAt: 'not-a-date' });
      expect(byField.startsAt).toBeDefined();
      expect(byField.endsAt).toBeUndefined();
    });

    it('still enforces the 24h lead', async () => {
      const { byField } = await check({
        startsAt: at(0),
        endsAt: at(2 * HOUR),
      });
      expect(byField.endsAt).toEqual([
        'endsAt must be at least 24 hours from now',
      ]);
    });
  });

  describe('options', () => {
    it('trims each option before it is forwarded', async () => {
      const { dto, byField } = await check({
        options: ['  Lisbon', 'Prague  '],
      });
      expect(byField).toEqual({});
      expect(dto.options).toEqual(['Lisbon', 'Prague']);
    });

    it('rejects an empty or whitespace-only option', async () => {
      for (const blank of ['', '   ']) {
        const { byField } = await check({ options: ['Lisbon', blank] });
        expect(byField.options).toEqual(['each option must not be empty']);
      }
    });

    it('rejects duplicates, ignoring case and surrounding spaces', async () => {
      const { byField } = await check({
        options: ['Lisbon', 'Prague', ' lisbon '],
      });
      expect(byField.options).toEqual(['options must all be different']);
    });

    it('still requires at least two options and only strings', async () => {
      expect(
        (await check({ options: ['Only one'] })).byField.options,
      ).toContain('options must contain at least 2 elements');
      expect(
        (await check({ options: ['Lisbon', 42] })).byField.options,
      ).toContain('each value in options must be a string');
    });
  });

  describe('title and description', () => {
    it('are trimmed before being forwarded', async () => {
      const { dto, byField } = await check({
        title: '  Best city for a weekend trip?  ',
        description: '\tPick the city you would most like to visit.\n',
      });
      expect(byField).toEqual({});
      expect(dto.title).toBe('Best city for a weekend trip?');
      expect(dto.description).toBe(
        'Pick the city you would most like to visit.',
      );
    });

    it('cannot meet the minimum length with padding', async () => {
      const { byField } = await check({
        title: '  ab   ',
        description: '   short    ',
      });
      expect(byField.title).toEqual([
        'title must be longer than or equal to 5 characters',
      ]);
      expect(byField.description).toEqual([
        'description must be longer than or equal to 10 characters',
      ]);
    });
  });
});
