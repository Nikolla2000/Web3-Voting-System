/**
 * Where to send a user after they sign in or register: back to the protected page that sent them
 * to sign in, carried as `?next=` on the auth pages' URLs.
 *
 * `next` comes from the URL, so anyone can craft it. Followed blindly it's an open redirect: a
 * link to our sign-in page that forwards the freshly signed-in user to a look-alike site. So only
 * a path on this site is accepted; for anything else this returns null and the caller uses its
 * own default.
 */
export const RETURN_TO_PARAM = 'next';

// Never return to the auth pages themselves: signing in only to land on sign-in again.
const AUTH_PATHS = ['/sign-in', '/register'];

// Any origin works as a base: it only lets URL resolve the path, then has to come back unchanged.
const BASE = 'http://return-to.invalid';

export function safeReturnTo(raw: string | string[] | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  // Must be a path. "//evil.com" and "/\evil.com" are protocol-relative URLs to another host
  // (browsers treat "\" as "/"), and control characters are stripped by URL parsing, which could
  // hide either. Rejecting them up front keeps the check below simple.
  if (!raw.startsWith('/') || raw.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE) return null;
  if (AUTH_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return null;

  return url.pathname + url.search + url.hash;
}

/** `/sign-in` (or `/register`) carrying where to come back to, if anywhere. */
export function authHref(page: '/sign-in' | '/register', returnTo?: string | null): string {
  if (!returnTo || returnTo === '/') return page;
  return `${page}?${new URLSearchParams({ [RETURN_TO_PARAM]: returnTo })}`;
}

/** The sign-in URL that brings the user back to the page the browser is on now. Client-side only. */
export function signInHrefForCurrentPage(): string {
  const { pathname, search, hash } = window.location;
  return authHref('/sign-in', safeReturnTo(pathname + search + hash));
}
