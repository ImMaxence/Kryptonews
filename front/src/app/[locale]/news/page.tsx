import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NewsBrowser, type NewsFilters } from '@/components/news/NewsBrowser';
import { JsonLd } from '@/components/ui/JsonLd';
import { PageHead } from '@/components/ui/PageHead';
import type { AppLocale } from '@/i18n/routing';
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import { getArticles, getSources } from '@/lib/server-api';

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) || undefined;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // Filtered result pages stay crawlable but are not indexed (canonical points to the wire).
  const filtered = Boolean(one(sp.q) || one(sp.lang) || one(sp.source));
  return pageMetadata({ locale, href: '/news', title: t('newsTitle'), description: t('newsDescription'), noindex: filtered });
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const lang = one(sp.lang);
  const filters: NewsFilters = {
    q: one(sp.q),
    lang: lang === 'en' || lang === 'fr' ? lang : undefined,
    source: one(sp.source),
  };

  const [t, tNav, initial, sources] = await Promise.all([
    getTranslations('news'),
    getTranslations('nav'),
    getArticles({ ...filters, pageSize: 24 }),
    getSources(),
  ]);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: tNav('home'), url: absoluteUrl(locale, '/') },
      { name: tNav('news'), url: absoluteUrl(locale, '/news') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('title'),
      url: absoluteUrl(locale, '/news'),
      inLanguage: locale,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: (initial?.items ?? []).slice(0, 12).map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'NewsArticle',
            headline: article.title,
            url: article.link,
            datePublished: article.publishedAt,
            inLanguage: article.lang,
            publisher: { '@type': 'Organization', name: article.source },
          },
        })),
      },
    },
  ];

  return (
    <div className="wrap page">
      <PageHead kicker={t('kicker')} title={t('title')} deck={t('deck', { count: sources.length })} />
      {initial ? (
        <NewsBrowser key={JSON.stringify(filters)} initial={initial} sources={sources} filters={filters} />
      ) : (
        <p className="empty-state">{t('empty')}</p>
      )}
      <JsonLd data={jsonLd} />
    </div>
  );
}
