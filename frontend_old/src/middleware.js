import { NextResponse } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18nConfig } from '../i18nConfig';

export function middleware(request) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;
  
  // Skip middleware for non-locale pages
  if (!pathname.startsWith('/readme')) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  if (locale && locale !== i18nConfig.defaultLocale) {
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

function detectLocale(request) {
  const negotiatorHeaders = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  const locale = matchLocale(languages, i18nConfig.locales, i18nConfig.defaultLocale);
  return locale;
}

export const config = {
  matcher: ['/readme'],
};