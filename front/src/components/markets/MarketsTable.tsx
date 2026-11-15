'use client';

import { useTranslations } from 'next-intl';
import { useDeferredValue, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/client-api';
import type { Coin, CoinList } from '@/lib/types';
import { SortIcon } from '../Icons';
import { usePrefs } from '../providers/PrefsProvider';
import { useSession } from '../providers/SessionProvider';
import { Change } from '../ui/Change';
import { CoinLabel } from '../ui/CoinLabel';
import { GuestWall } from '../ui/GuestWall';
import { Money } from '../ui/Money';
import { SaveButton } from '../ui/SaveButton';
import { Sparkline } from '../ui/Sparkline';
import { CurrencySelect } from './CurrencySelect';
import { MarketStats } from './MarketStats';

type SortKey = 'rank' | 'name' | 'price' | 'change1h' | 'change24h' | 'change7d' | 'marketCap' | 'volume24h';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

function compare(a: Coin, b: Coin, { key, dir }: Sort) {
  const factor = dir === 'asc' ? 1 : -1;
  if (key === 'name') return a.name.localeCompare(b.name) * factor;
  const left = a[key] ?? (dir === 'asc' ? Infinity : -Infinity);
  const right = b[key] ?? (dir === 'asc' ? Infinity : -Infinity);
  return (left - right) * factor;
}

export function MarketsTable({ initial }: { initial: CoinList }) {
  const t = useTranslations('markets');
  const tWall = useTranslations('guestWall');
  const { currency } = usePrefs();
  const { user } = useSession();
  const { data } = useSWR<CoinList>('/api/cryptos', fetcher, {
    fallbackData: initial,
    refreshInterval: 120_000,
    revalidateOnMount: false,
  });
  const list = data ?? initial;

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [sort, setSort] = useState<Sort>({ key: 'rank', dir: 'asc' });

  const rows = useMemo(() => {
    const needle = normalize(deferredQuery.trim());
    const filtered = needle
      ? list.items.filter((coin) => normalize(coin.name).includes(needle) || normalize(coin.symbol).includes(needle))
      : list.items;
    return [...filtered].sort((a, b) => compare(a, b, sort));
  }, [list.items, deferredQuery, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'rank' || key === 'name' ? 'asc' : 'desc' },
    );

  const header = (key: SortKey, label: string, { text = false, srLabel }: { text?: boolean; srLabel?: string } = {}) => {
    const active = sort.key === key;
    return (
      <th scope="col" className={text ? 'is-text' : undefined} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
        <button type="button" className="ledger__sort" onClick={() => toggleSort(key)}>
          <span aria-hidden={srLabel ? true : undefined}>{label}</span>
          {srLabel && <span className="sr-only">{srLabel}</span>}
          <SortIcon dir={active ? sort.dir : undefined} className="ledger__sort-icon" />
        </button>
      </th>
    );
  };

  return (
    <>
      <MarketStats summary={list.summary} />

      <div className="ledger-tools">
        <div className="ledger-tools__filters">
          <div className="field">
            <label htmlFor="coin-filter" className="field__label">
              {t('searchLabel')}
            </label>
            <input
              id="coin-filter"
              className="input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <CurrencySelect />
        </div>
        <p className="page-head__meta" aria-live="polite">
          {t('showing', { shown: rows.length })}
        </p>
      </div>

      <div className="ledger-scroll" role="region" aria-labelledby="ledger-caption" tabIndex={0}>
        <table className="ledger">
          <caption id="ledger-caption" className="sr-only">
            {t('caption', { currency: currency.toUpperCase() })}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="col-save">
                <span className="sr-only">{t('watch')}</span>
              </th>
              {header('rank', '#', { srLabel: t('rank') })}
              {header('name', t('name'), { text: true })}
              {header('price', t('price'))}
              {header('change1h', t('change1h'))}
              {header('change24h', t('change24h'))}
              {header('change7d', t('change7d'))}
              {header('marketCap', t('marketCap'))}
              {header('volume24h', t('volume'))}
              <th scope="col" className="col-spark">
                <span className="ledger__static-head">{t('last7d')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((coin) => (
              <tr key={coin.id}>
                <td className="col-save">
                  <SaveButton kind="crypto" refId={coin.id} label={coin.name} meta={{ source: coin.symbol }} flat />
                </td>
                <td className="col-rank">{coin.rank ?? '—'}</td>
                <th scope="row" className="is-text">
                  <CoinLabel id={coin.id} name={coin.name} symbol={coin.symbol} image={coin.image} />
                </th>
                <td className="col-price">
                  <Money usd={coin.price} />
                </td>
                <td>
                  <Change value={coin.change1h} />
                </td>
                <td>
                  <Change value={coin.change24h} />
                </td>
                <td>
                  <Change value={coin.change7d} />
                </td>
                <td>
                  <Money usd={coin.marketCap} compact />
                </td>
                <td>
                  <Money usd={coin.volume24h} compact />
                </td>
                <td className="col-spark">
                  <Sparkline data={coin.sparkline} change={coin.change7d} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="ledger__empty">
                  {list.items.length ? t('noResults', { query: deferredQuery }) : t('empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {list.limited && !user && <GuestWall message={tWall('coins', { shown: list.items.length, total: list.total })} />}
    </>
  );
}
