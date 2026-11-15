import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Archivo, Grenze_Gotisch, IBM_Plex_Mono, Newsreader } from 'next/font/google';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer } from '@/components/chrome/Footer';
import { GuestImport } from '@/components/auth/GuestImport';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { GuestBanner } from '@/components/chrome/GuestBanner';
import { Masthead } from '@/components/chrome/Masthead';
import { RouteFocus } from '@/components/chrome/RouteFocus';
import { themeScript } from '@/components/chrome/ThemeToggle';
import { Ticker } from '@/components/chrome/Ticker';
import { PrefsProvider } from '@/components/providers/PrefsProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { routing } from '@/i18n/routing';
import { formatDate } from '@/lib/format';
import { getCurrencyPreference, getRates, getSession, getSiteConfig, getTicker } from '@/lib/server-api';
import { AUTHOR_URL, contactEmail, editionNumber, SITE_NAME, siteUrl } from '@/lib/site';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/components.css';
import '@/styles/pages.css';

// Fonts are downloaded at build time and served from our own origin (no request to Google).
const grenze = Grenze_Gotisch({ subsets: ['latin'], weight: ['800'], variable: '--font-grenze', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-newsreader', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
// Preloaded: big prices in a fallback monospace would shift the layout when Plex arrives.
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex-mono', display: 'swap' });

/** Namespaces only read by server components: never shipped to the browser. */
const SERVER_ONLY_NAMESPACES = ['meta', 'faq', 'footer', 'about', 'legal', 'notFound'];

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : 'en', namespace: 'meta' });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t('siteTitle'), template: `%s · ${SITE_NAME}` },
    description: t('siteDescription'),
    applicationName: SITE_NAME,
    authors: [{ name: 'Maxence Bonnici', url: AUTHOR_URL }],
    creator: 'Maxence Bonnici',
    publisher: SITE_NAME,
    category: 'finance',
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3eee3' },
    { media: '(prefers-color-scheme: dark)', color: '#141210' },
  ],
  colorScheme: 'light dark',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const [t, messages, user, config, ticker, rates, currency] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getMessages(),
    getSession(),
    getSiteConfig(),
    getTicker(),
    getRates(),
    getCurrencyPreference(locale),
  ]);

  // Base64 keeps the address out of plain-text HTML scrapers (it is decoded on click).
  const email = contactEmail();
  const encodedContact = email ? Buffer.from(email).toString('base64') : null;

  const now = new Date();
  const rawDate = formatDate(now, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  return (
    <html
      lang={locale}
      className={`${grenze.variable} ${newsreader.variable} ${archivo.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored day/night edition before first paint. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <NextIntlClientProvider
          messages={Object.fromEntries(Object.entries(messages).filter(([namespace]) => !SERVER_ONLY_NAMESPACES.includes(namespace)))}
        >
          <SessionProvider user={user} config={config ? { ...config, contact: encodedContact } : null}>
            <PrefsProvider initialCurrency={currency} rates={rates}>
              <ToastProvider>
                <a href="#main" className="skip-link">
                  {t('skipToContent')}
                </a>
                <Masthead edition={editionNumber(now)} dateLabel={dateLabel} isoDate={now.toISOString().slice(0, 10)} />
                <Ticker initial={ticker?.items ?? []} />
                <GuestBanner />
                <main id="main" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
                <RouteFocus />
                <GuestImport />
                <PwaRegister />
              </ToastProvider>
            </PrefsProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
