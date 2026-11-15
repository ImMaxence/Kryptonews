'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import useSWR from 'swr';
import { Link } from '@/i18n/navigation';
import { fetcher } from '@/lib/client-api';
import { formatPercent, trend } from '@/lib/format';
import type { TickerItem } from '@/lib/types';
import { PauseIcon, PlayIcon } from '../Icons';
import { usePrefs } from '../providers/PrefsProvider';

function TickerList({ items, hidden }: { items: TickerItem[]; hidden?: boolean }) {
  const locale = useLocale();
  const { money } = usePrefs();
  return (
    <ul className="ticker__list" aria-hidden={hidden || undefined} inert={hidden || undefined}>
      {items.map((coin) => {
        const direction = trend(coin.change24h);
        return (
          <li key={coin.id} className="ticker__item">
            <Link href={{ pathname: '/markets/[id]', params: { id: coin.id } }} prefetch={false}>
              <span className="ticker__symbol">{coin.symbol}</span>
              <span suppressHydrationWarning>{money(coin.price)}</span>
              <span className={direction === 'up' ? 't-up' : direction === 'down' ? 't-down' : undefined} suppressHydrationWarning>
                <span aria-hidden="true">{direction === 'up' ? '▲' : direction === 'down' ? '▼' : '■'} </span>
                {formatPercent(coin.change24h, locale)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Ticker({ initial }: { initial: TickerItem[] }) {
  const t = useTranslations('ticker');
  const [paused, setPaused] = useState(false);
  const { data } = useSWR<{ items: TickerItem[] }>('/api/cryptos/ticker', fetcher, {
    fallbackData: { items: initial },
    refreshInterval: 60_000,
    revalidateOnMount: false,
  });
  const items = data?.items ?? [];

  return (
    <section className="ticker" aria-label={t('region')} data-paused={paused}>
      <span className="ticker__label" aria-hidden="true">
        {t('label')}
      </span>
      <div className="ticker__viewport">
        {items.length ? (
          <div className="ticker__track">
            <TickerList items={items} />
            <TickerList items={items} hidden />
          </div>
        ) : (
          <p className="ticker__empty">{t('empty')}</p>
        )}
      </div>
      {items.length > 0 && (
        <button
          type="button"
          className="ticker__toggle"
          aria-pressed={paused}
          aria-label={paused ? t('play') : t('pause')}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      )}
    </section>
  );
}
