'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, type ElementType } from 'react';
import type { Article } from '@/lib/types';
import { ExternalIcon } from '../Icons';
import { SaveButton } from './SaveButton';
import { TimeAgo } from './TimeAgo';

type Variant = 'lead' | 'standard' | 'compact' | 'wire';

export function StoryCard({
  article,
  variant = 'standard',
  as: Heading = 'h3',
  showImage = variant !== 'wire',
  dropcap = false,
}: {
  article: Article;
  variant?: Variant;
  as?: ElementType;
  showImage?: boolean;
  dropcap?: boolean;
}) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [broken, setBroken] = useState(false);
  const foreign = article.lang !== locale;

  return (
    <article className={`story story--${variant}`} lang={foreign ? article.lang : undefined}>
      {showImage &&
        (article.image && !broken ? (
          <div className="story__media halftone">
            <img
              src={article.image}
              alt=""
              width={640}
              height={variant === 'lead' ? 360 : 400}
              loading={variant === 'lead' ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setBroken(true)}
            />
          </div>
        ) : (
          <div className="story__media halftone halftone--empty" aria-hidden="true">
            <span className="kicker">{article.source}</span>
          </div>
        ))}

      <p className="story__kicker kicker">
        <span>{article.source}</span>
        <span className="story__lang">{article.lang.toUpperCase()}</span>
      </p>

      <Heading className="story__headline">
        <a className="story__link marker-link" href={article.link} target="_blank" rel="noopener noreferrer">
          {article.title}
          <ExternalIcon className="story__ext" />
          <span className="sr-only" lang={locale}>
            {' '}
            {t('opensInNewTab')}
          </span>
        </a>
      </Heading>

      {article.summary && variant !== 'wire' && <p className={`story__summary${dropcap ? ' dropcap' : ''}`}>{article.summary}</p>}

      <div className="story__meta" lang={locale}>
        <TimeAgo value={article.publishedAt} />
        <SaveButton kind="article" refId={article.id} label={article.title} meta={{ url: article.link, image: article.image, source: article.source }} />
      </div>
    </article>
  );
}
