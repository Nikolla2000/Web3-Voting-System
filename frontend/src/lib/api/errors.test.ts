import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { getApiErrorMessage } from '@/lib/api/errors';

function axiosError(status: number, data?: unknown, headers: Record<string, string> = {}) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', config, null, {
    status,
    statusText: '',
    data,
    headers,
    config,
  });
}

describe('getApiErrorMessage', () => {
  it('surfaces the gateway message string', () => {
    expect(getApiErrorMessage(axiosError(409, { message: 'Email already in use' }))).toBe(
      'Email already in use',
    );
  });

  it('uses the first entry of a class-validator message array', () => {
    expect(
      getApiErrorMessage(
        axiosError(400, { message: ['title too short', 'description too short'] }),
      ),
    ).toBe('title too short');
  });

  it('turns a 429 with Retry-After into a countdown message', () => {
    expect(
      getApiErrorMessage(
        axiosError(429, { message: 'ThrottlerException' }, { 'retry-after': '42' }),
      ),
    ).toBe('Too many requests — try again in 42s.');
  });

  it.each<Record<string, string>>([{}, { 'retry-after': 'soon' }, { 'retry-after': '0' }])(
    'falls back to a generic 429 message when Retry-After is unusable (%o)',
    (headers) => {
      expect(getApiErrorMessage(axiosError(429, undefined, headers))).toBe(
        'Too many requests — please try again shortly.',
      );
    },
  );

  it('uses the caller-supplied fallback for unusable payloads and non-axios errors', () => {
    expect(getApiErrorMessage(axiosError(500, { message: [] }), 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(axiosError(500, '<html>'), 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(new Error('network'), 'fallback')).toBe('fallback');
  });
});
