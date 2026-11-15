import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GuestButton } from '@/components/auth/GuestButton';
import { ArrowRightIcon, ScissorsIcon } from '@/components/Icons';
import { MarketReport } from '@/components/markets/MarketReport';
import { JsonLd } from '@/components/ui/JsonLd';
import { StoryCard } from '@/components/ui/StoryCard';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { getArticles, getCoins, getSession } from '@/lib/server-api';
import { AUTHOR_URL, REPO_URL, SITE_NAME, siteUrl } from '@/lib/site';

type Props = { params: Promise<{ locale: AppLocale }> };

const FAQ_KEYS = ['what', 'data', 'refresh', 'free', 'sources', 'advice'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/', title: t('homeTitle'), description: t('siteDescription'), absoluteTitle: true });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const [t, tFaq, tMeta, tNav, user, local, everything, coins] = await Promise.all([
    getTranslations('home'),
    getTranslations('faq'),
    getTranslations('meta'),
    getTranslations('nav'),
    getSession(),
    getArticles({ lang: locale, pageSize: 5 }),
    getArticles({ pageSize: 12 }),
    getCoins(),
  ]);

  // Lead + secondary stories in the reader's language, the wire mixes every newsroom.
  const front = local?.items.length ? local.items : (everything?.items ?? []).slice(0, 5);
  const [lead, ...secondary] = front;
  const wire = (everything?.items ?? []).filter((a) => !front.some((f) => f.id === a.id)).slice(0, 9);

  const site = siteUrl();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${site}/#organization`,
      name: SITE_NAME,
      url: site,
      logo: `${site}/apple-icon`,
      founder: { '@type': 'Person', name: 'Maxence Bonnici', url: AUTHOR_URL },
      sameAs: [REPO_URL],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${site}/#website-${locale}`,
      name: SITE_NAME,
      url: absoluteUrl(locale, '/'),
      inLanguage: locale,
      description: tMeta('siteDescription'),
      publisher: { '@id': `${site}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl(locale, '/news')}?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: locale,
      mainEntity: FAQ_KEYS.map((key) => ({
        '@type': 'Question',
        name: tFaq(`${key}.q`),
        acceptedAnswer: { '@type': 'Answer', text: tFaq(`${key}.a`) },
      })),
    },
  ];

  return (
    <div className="wrap">
      <h1 className="sr-only">{t('h1')}</h1>

      <div className="front">
        <div className="front__main">
          {lead ? (
            <section className="front__lead" aria-labelledby="lead-title">
              <h2 id="lead-title" className="kicker kicker--accent">
                {t('leadKicker')}
              </h2>
              <StoryCard article={lead} variant="lead" as="h3" dropcap />
            </section>
          ) : (
            <p className="empty-state">{t('empty')}</p>
          )}

          {secondary.length > 0 && (
            <section aria-labelledby="also-title">
              <div className="section-head">
                <h2 id="also-title">{t('latestKicker')}</h2>
              </div>
              <div className="front__secondary">
                {secondary.map((article) => (
                  <StoryCard key={article.id} article={article} variant="compact" as="h3" />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="front__rail" aria-label={t('marketReport')}>
          {coins && coins.items.length ? (
            <MarketReport leaders={coins.items.slice(0, 2)} summary={coins.summary} />
          ) : (
            <p className="empty-state">{t('marketsEmpty')}</p>
          )}
        </aside>
      </div>

      {wire.length > 0 && (
        <section aria-labelledby="wire-title" style={{ marginTop: '2.5rem' }}>
          <div className="section-head">
            <h2 id="wire-title">{t('wireKicker')}</h2>
            <Link href="/news">
              {t('seeNews')} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="wire-grid">
            {wire.map((article) => (
              <StoryCard key={article.id} article={article} variant="wire" as="h3" />
            ))}
          </div>
        </section>
      )}

      <section className="editor-box" aria-labelledby="editor-title">
        <div>
          <p className="kicker kicker--accent">{t('editorKicker')}</p>
          <h2 id="editor-title" className="editor-box__title">
            {t('editorTitle')}
          </h2>
          <div className="editor-box__body">
            <p className="dropcap">{t('editorBody')}</p>
            <p>{t('editorBody2')}</p>
          </div>
        </div>
        {user ? (
          <div className="coupon">
            <p className="coupon__title">{t('seeMarkets')}</p>
            <div className="coupon__actions">
              <Link href="/markets" className="btn btn--solid">
                {t('seeMarkets')} <ArrowRightIcon width={16} height={16} />
              </Link>
              <Link href="/favorites" className="btn">
                {tNav('favorites')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="coupon">
            <span className="coupon__scissors">
              <ScissorsIcon />
              {t('subscribeCta')}
            </span>
            <span className="stamp coupon__stamp" aria-hidden="true">
              0 €
            </span>
            <p className="coupon__title">{t('subscribeCta')}</p>
            <div className="coupon__actions">
              <Link href="/register" className="btn btn--solid">
                {t('subscribeCta')} <ArrowRightIcon width={16} height={16} />
              </Link>
              <GuestButton className="btn btn--dashed" />
            </div>
          </div>
        )}
      </section>

      <section className="front-faq" aria-labelledby="faq-title">
        <div>
          <p className="kicker kicker--accent">{t('faqKicker')}</p>
          <h2 id="faq-title" className="front-faq__title">
            {t('faqTitle')}
          </h2>
        </div>
        <div className="faq">
          {FAQ_KEYS.map((key) => (
            <details key={key} name="faq">
              <summary>{tFaq(`${key}.q`)}</summary>
              <p>{tFaq(`${key}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      <JsonLd data={jsonLd} />
    </div>
  );
}
