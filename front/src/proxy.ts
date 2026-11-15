import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);
const isProd = process.env.NODE_ENV === 'production';

/**
 * Locale routing + a per-request nonce Content Security Policy: only scripts carrying
 * the nonce (Next.js adds it to its own scripts automatically) can run, no 'unsafe-inline'.
 */
export default function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // React sets a few inline style attributes, which nonces cannot cover.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  // Next.js reads the nonce from this request header and applies it to its scripts.
  if (isProd) headers.set('content-security-policy', csp);

  const response = intl(new NextRequest(request, { headers }));
  if (isProd) response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  // Skip the API proxy, Next internals, metadata routes and anything with a file extension.
  matcher: ['/((?!api|healthz|_next|_vercel|icon|apple-icon|.*\\..*).*)'],
};
