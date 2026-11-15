'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useErrorText } from '@/hooks/useErrorText';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/format';
import type { Favorite } from '@/lib/types';
import { ExternalIcon, StarIcon, TrashIcon } from '../Icons';
import { useToast } from '../providers/ToastProvider';
import { Change } from '../ui/Change';
import { CoinLabel } from '../ui/CoinLabel';
import { Money } from '../ui/Money';

/** Guest clippings come from localStorage (user-editable): only plain web links are rendered. */
const safeHref = (url: string | null) => (url && /^https?:\/\//i.test(url) ? url : null);
const safeSrc = (src: string | null) => (src && (src.startsWith('/api/media/') || /^https:\/\//i.test(src)) ? src : null);

function ClipImage({ src }: { src: string | null }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <div className="halftone halftone--empty" aria-hidden="true" />;
  return (
    <div className="halftone">
      <img src={src} alt="" loading="lazy" decoding="async" width={480} height={320} onError={() => setBroken(true)} />
    </div>
  );
}

export function Clippings() {
  const t = useTranslations('favorites');
  const tSave = useTranslations('save');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const toast = useToast();
  const errorText = useErrorText();
  const { items, remove } = useFavorites();

  const articles = items.filter((f) => f.kind === 'article');
  const coins = items.filter((f) => f.kind === 'crypto');

  const onRemove = async (favorite: Favorite) => {
    try {
      await remove(favorite.id);
      toast(tSave('removed'));
    } catch (error) {
      toast(errorText(error));
    }
  };

  return (
    <>
      <section aria-labelledby="clipped-title">
        <div className="section-head">
          <h2 id="clipped-title">
            {t('articles')} ({articles.length})
          </h2>
          <Link href="/news">{t('browseNews')}</Link>
        </div>
        {articles.length ? (
          <ul className="clippings">
            {articles.map((favorite) => (
              <li key={favorite.id}>
                <article className="clipping">
                  <ClipImage src={safeSrc(favorite.image)} />
                  {favorite.source && <p className="kicker kicker--accent">{favorite.source}</p>}
                  <h3 className="clipping__title">
                    {safeHref(favorite.url) ? (
                      <a className="marker-link" href={safeHref(favorite.url)!} target="_blank" rel="noopener noreferrer">
                        {favorite.title}
                        <ExternalIcon className="story__ext" />
                        <span className="sr-only"> {tCommon('opensInNewTab')}</span>
                      </a>
                    ) : (
                      favorite.title
                    )}
                  </h3>
                  <div className="clipping__meta">
                    <span suppressHydrationWarning>{t('clippedOn', { date: formatDate(favorite.createdAt, locale, { dateStyle: 'medium' }) })}</span>
                    <button type="button" className="icon-btn" aria-label={t('remove', { title: favorite.title })} title={t('remove', { title: favorite.title })} onClick={() => onRemove(favorite)}>
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{t('emptyArticles')}</p>
        )}
      </section>

      <section aria-labelledby="watched-title" style={{ marginTop: '3rem' }}>
        <div className="section-head">
          <h2 id="watched-title">
            {t('coins')} ({coins.length})
          </h2>
          <Link href="/markets">{t('browseMarkets')}</Link>
        </div>
        {coins.length ? (
          <ul className="watchlist">
            {coins.map((favorite) => (
              <li key={favorite.id}>
                <CoinLabel id={favorite.refId} name={favorite.title} symbol={favorite.source ?? ''} image={favorite.image} />
                <Money usd={favorite.coin?.price} className="mono" />
                <Change value={favorite.coin?.change24h} />
                <button
                  type="button"
                  className="save-btn save-btn--flat"
                  aria-pressed="true"
                  aria-label={tSave('unwatch', { name: favorite.title })}
                  title={tSave('unwatch', { name: favorite.title })}
                  onClick={() => onRemove(favorite)}
                >
                  <StarIcon filled />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{t('emptyCoins')}</p>
        )}
      </section>
    </>
  );
}
