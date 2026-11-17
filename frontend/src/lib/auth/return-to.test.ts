import { describe, expect, it } from 'vitest';
import { authHref, safeReturnTo } from '@/lib/auth/return-to';

describe('safeReturnTo', () => {
  it.each([
    ['/polls/create', '/polls/create'],
    ['/polls/abc?tab=results#votes', '/polls/abc?tab=results#votes'],
    ['/profile', '/profile'],
    // Normalised, but still a path on this site.
    ['/polls/../profile', '/profile'],
    ['/sign-in-help', '/sign-in-help'],
  ])('keeps the same-site path %s', (raw, expected) => {
    expect(safeReturnTo(raw)).toBe(expected);
  });

  it.each([
    ['an absolute URL', 'https://evil.example/login'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash the browser reads as a slash', '/\\evil.example'],
    ['a backslash after the first slash', '/\\/evil.example'],
    ['a tab hiding a second slash', '/\t/evil.example'],
    ['a newline hiding a second slash', '/\n/evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a data: URL', 'data:text/html,<script>alert(1)</script>'],
    ['a relative path', 'polls/create'],
    ['an empty string', ''],
  ])('rejects %s', (_name, raw) => {
    expect(safeReturnTo(raw)).toBeNull();
  });

  it.each(['/sign-in', '/sign-in?next=/profile', '/register', '/register/'])(
    'rejects the auth page %s itself, which would loop back to sign-in',
    (raw) => {
      expect(safeReturnTo(raw)).toBeNull();
    },
  );

  it('rejects a missing or repeated parameter', () => {
    expect(safeReturnTo(undefined)).toBeNull();
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo(['/a', '/b'])).toBeNull();
  });
});

describe('authHref', () => {
  it('encodes the return path as next', () => {
    expect(authHref('/sign-in', '/polls/abc?tab=results')).toBe('/sign-in?next=%2Fpolls%2Fabc%3Ftab%3Dresults');
    expect(authHref('/register', '/profile')).toBe('/register?next=%2Fprofile');
  });

  it('leaves the URL clean when there is nowhere special to go back to', () => {
    expect(authHref('/sign-in', null)).toBe('/sign-in');
    expect(authHref('/sign-in', '/')).toBe('/sign-in');
  });

  it('round-trips through safeReturnTo', () => {
    const href = authHref('/sign-in', '/polls/abc?x=1&y=2#z');
    const next = new URLSearchParams(href.split('?')[1]).get('next');
    expect(safeReturnTo(next)).toBe('/polls/abc?x=1&y=2#z');
  });
});
