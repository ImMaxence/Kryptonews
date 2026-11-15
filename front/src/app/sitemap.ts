import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { absoluteUrl, languageAlternates } from '@/lib/seo';
import { tryApi } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

type Href = Parameters<typeof absoluteUrl>[1];

const PAGES: { href: Href; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { href: '/', changeFrequency: 'hourly', priority: 1 },
  { href: '/markets', changeFrequency: 'always', priority: 0.9 },
  { href: '/news', changeFrequency: 'hourly', priority: 0.9 },
  { href: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { href: '/register', changeFrequency: 'yearly', priority: 0.4 },
  { href: '/legal-notice', changeFrequency: 'yearly', priority: 0.2 },
  { href: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { href: '/terms', changeFrequency: 'yearly', priority: 0.2 },
  { href: '/accessibility', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const coins = (await tryApi<{ items: { id: string; updatedAt: string }[] }>('/cryptos/sitemap', { auth: false }))?.items ?? [];

  const entries: MetadataRoute.Sitemap = [];
  for (const page of PAGES) {
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(locale, page.href),
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: languageAlternates(page.href) },
      });
    }
  }
  for (const coin of coins) {
    const href = { pathname: '/markets/[id]' as const, params: { id: coin.id } };
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(locale, href),
        lastModified: new Date(coin.updatedAt),
        changeFrequency: 'hourly',
        priority: 0.7,
        alternates: { languages: languageAlternates(href) },
      });
    }
  }
  return entries;
}
