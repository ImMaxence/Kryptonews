import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isProd = process.env.NODE_ENV === 'production';

// Pages get a per-request nonce CSP from src/proxy.ts. Everything else (API JSON,
// metadata routes, the offline page) is locked down with this static policy.
const staticCsp = "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ...(isProd
    ? [
        // Browsers ignore HSTS over plain http, so this is harmless on localhost.
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        // Every resource is same-origin (fonts and images are proxied), so this costs nothing.
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Static TTFs used by the generated Open Graph images and icons.
  outputFileTracingIncludes: {
    '/**': ['./src/assets/fonts/**/*'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...(isProd
        ? ['/api/:path*', '/offline.html', '/llms.txt', '/llms-full.txt', '/robots.txt', '/sitemap.xml', '/favicon.ico', '/sw.js', '/manifest.webmanifest'].map((source) => ({
            source,
            headers: [{ key: 'Content-Security-Policy', value: staticCsp }],
          }))
        : []),
      // Social networks may display share cards directly from our domain.
      ...['/:locale/opengraph-image', '/:locale/markets/:id/opengraph-image'].map((source) => ({
        source,
        headers: [{ key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }],
      })),
      // The service worker must always be revalidated so updates reach installed apps.
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
    ];
  },
};

export default withNextIntl(nextConfig);
