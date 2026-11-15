import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CoinFigures, CoinPrice } from '@/components/coin/CoinFigures';
import { Converter } from '@/components/coin/Converter';
import { PriceChart } from '@/components/coin/PriceChart';
import { JsonLd } from '@/components/ui/JsonLd';
import { SaveButton } from '@/components/ui/SaveButton';
import { StoryCard } from '@/components/ui/StoryCard';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import { getArticles, getCoin } from '@/lib/server-api';

type Props = { params: Promise<{ locale: AppLocale; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const data = await getCoin(id);
  if (!data) return { title: t('notFoundTitle'), robots: { index: false } };
  const { name, symbol } = data.item;
  return pageMetadata({
    locale,
    href: { pathname: '/markets/[id]', params: { id } },
    title: t('coinTitle', { name, symbol }),
    description: t('coinDescription', { name, symbol }),
  });
}

export default async function CoinPage({ params }: Props) {
  const { locale, id } = await params;
  const data = await getCoin(id);
  if (!data) notFound();
  const coin = data.item;

  const [t, tNav, tFooter, related] = await Promise.all([
    getTranslations('coin'),
    getTranslations('nav'),
    getTranslations('footer'),
    getArticles({ coin: coin.id, pageSize: 6 }),
  ]);

  const url = absoluteUrl(locale, { pathname: '/markets/[id]', params: { id: coin.id } });
  const jsonLd = [
    breadcrumbJsonLd([
      { name: tNav('home'), url: absoluteUrl(locale, '/') },
      { name: tNav('markets'), url: absoluteUrl(locale, '/markets') },
      { name: coin.name, url },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ExchangeRateSpecification',
      name: `${coin.name} (${coin.symbol}) / USD`,
      url,
      currency: coin.symbol,
      currentExchangeRate: { '@type': 'UnitPriceSpecification', price: coin.price, priceCurrency: 'USD' },
      ...(coin.updatedAt ? { validFrom: coin.updatedAt } : {}),
    },
  ];

  return (
    <div className="wrap page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/markets">{t('breadcrumb')}</Link>
          </li>
          <li aria-current="page">{coin.name}</li>
        </ol>
      </nav>

      {!coin.listed && <p className="form-alert stale-note">{t('stale')}</p>}

      <header className="coin-head">
        {coin.imageLarge ? (
          <img className="coin-head__icon" src={coin.imageLarge} alt="" width={80} height={80} />
        ) : (
          <span className="coin-head__icon" aria-hidden="true" />
        )}
        <div>
          {coin.rank && <p className="kicker kicker--accent">{t('rank', { rank: coin.rank })}</p>}
          <h1 className="coin-head__title">
            {coin.name}
            <small>{coin.symbol}</small>
          </h1>
          <p className="page-head__meta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
            <SaveButton kind="crypto" refId={coin.id} label={coin.name} />
            {coin.updatedAt && <TimeAgo value={coin.updatedAt} template={t.raw('dataUpdated') as string} />}
          </p>
        </div>
        <CoinPrice coin={coin} />
      </header>

      <div className="coin-layout">
        <div>
          <PriceChart coinId={coin.id} name={coin.name} />

          <section className="related" aria-labelledby="related-title">
            <div className="section-head">
              <h2 id="related-title">{t('relatedTitle', { name: coin.name })}</h2>
              <Link href={{ pathname: '/news', query: { q: coin.name } }}>
                {tNav('news')} <span aria-hidden="true">→</span>
              </Link>
            </div>
            {related?.items.length ? (
              <div className="related__grid">
                {related.items.map((article) => (
                  <StoryCard key={article.id} article={article} variant="wire" as="h3" />
                ))}
              </div>
            ) : (
              <p className="empty-state">{t('relatedEmpty', { name: coin.name })}</p>
            )}
          </section>
        </div>

        <aside className="coin-layout__side" aria-label={t('statsTitle')}>
          <CoinFigures coin={coin} />
          <Converter symbol={coin.symbol} priceUsd={coin.price} />
          <p className="chart__note">{tFooter('disclaimer')}</p>
        </aside>
      </div>

      <JsonLd data={jsonLd} />
    </div>
  );
}
