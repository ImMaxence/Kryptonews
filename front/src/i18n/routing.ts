import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Language preference only (read by the proxy). Secure over https in production.
  localeCookie: { name: 'kn_locale', maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === 'production' },
  pathnames: {
    '/': '/',
    '/markets': { en: '/markets', fr: '/marches' },
    '/markets/[id]': { en: '/markets/[id]', fr: '/marches/[id]' },
    '/news': { en: '/news', fr: '/actualites' },
    '/favorites': { en: '/clippings', fr: '/coupures' },
    '/account': { en: '/account', fr: '/compte' },
    '/admin': { en: '/editors-desk', fr: '/redaction' },
    '/login': { en: '/login', fr: '/connexion' },
    '/register': { en: '/register', fr: '/inscription' },
    '/reset-password': { en: '/reset-password', fr: '/mot-de-passe' },
    '/about': { en: '/about', fr: '/a-propos' },
    '/legal-notice': { en: '/legal-notice', fr: '/mentions-legales' },
    '/privacy': { en: '/privacy', fr: '/confidentialite' },
    '/terms': { en: '/terms', fr: '/conditions-utilisation' },
    '/accessibility': { en: '/accessibility', fr: '/accessibilite' },
  },
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
