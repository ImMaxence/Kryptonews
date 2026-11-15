'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { useErrorText } from '@/hooks/useErrorText';
import { getPathname, useRouter } from '@/i18n/navigation';
import { fetcher } from '@/lib/client-api';
import type { Article, ArticlePage, Source } from '@/lib/types';
import { useSession } from '../providers/SessionProvider';
import { useToast } from '../providers/ToastProvider';
import { GuestWall } from '../ui/GuestWall';
import { StoryCard } from '../ui/StoryCard';

export interface NewsFilters {
  q?: string;
  lang?: string;
  source?: string;
}

/**
 * The filter form is a plain GET form (works without JavaScript); with JS it
 * navigates client-side. "Load more" appends pages fetched from the API.
 */
export function NewsBrowser({ initial, sources, filters }: { initial: ArticlePage; sources: Source[]; filters: NewsFilters }) {
  const t = useTranslations('news');
  const tWall = useTranslations('guestWall');
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const errorText = useErrorText();
  const { user } = useSession();

  const [items, setItems] = useState<Article[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query: Record<string, string> = {};
    for (const key of ['q', 'lang', 'source']) {
      const value = String(data.get(key) ?? '').trim();
      if (value) query[key] = value;
    }
    router.push({ pathname: '/news', query });
  };

  const loadMore = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), pageSize: String(initial.pageSize) });
      for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
      const next = await fetcher<ArticlePage>(`/api/articles?${params}`);
      setItems((current) => [...current, ...next.items.filter((a) => !current.some((c) => c.id === a.id))]);
      setPage(next.page);
      setHasMore(next.hasMore);
    } catch (error) {
      toast(errorText(error));
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = Boolean(filters.q || filters.lang || filters.source);

  return (
    <>
      <form className="news-filters" role="search" aria-label={t('filtersLabel')} action={getPathname({ locale, href: '/news' })} method="get" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="news-q" className="field__label">
            {t('searchLabel')}
          </label>
          <input id="news-q" name="q" type="search" className="input" defaultValue={filters.q} placeholder={t('searchPlaceholder')} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="news-lang" className="field__label">
            {t('languageLabel')}
          </label>
          <select id="news-lang" name="lang" className="select" defaultValue={filters.lang ?? ''}>
            <option value="">{t('allLanguages')}</option>
            <option value="fr" lang="fr">
              Français
            </option>
            <option value="en" lang="en">
              English
            </option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="news-source" className="field__label">
            {t('sourceLabel')}
          </label>
          <select id="news-source" name="source" className="select" defaultValue={filters.source ?? ''}>
            <option value="">{t('allSources')}</option>
            {sources.map((source) => (
              <option key={source.name} value={source.name}>
                {source.name} ({source.lang.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        <div className="news-filters__actions">
          <button type="submit" className="btn btn--solid">
            {t('searchSubmit')}
          </button>
        </div>
      </form>

      <div className="news-meta">
        <p aria-live="polite">{t('results', { count: initial.total })}</p>
        {hasFilters && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => router.push('/news')}>
            {t('reset')}
          </button>
        )}
      </div>

      {items.length ? (
        <div className="news-grid">
          {items.map((article, index) => (
            <StoryCard key={article.id} article={article} as="h2" dropcap={index === 0} />
          ))}
        </div>
      ) : (
        <p className="empty-state">{t('empty')}</p>
      )}

      {hasMore && (
        <div className="news-more">
          <button type="button" className="btn" onClick={loadMore} disabled={loading} aria-busy={loading}>
            {loading ? '…' : t('loadMore')}
          </button>
        </div>
      )}

      {initial.limited && !user && <GuestWall message={tWall('news', { shown: initial.limit ?? items.length })} />}
    </>
  );
}
