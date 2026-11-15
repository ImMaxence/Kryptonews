'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatDate, formatNumber } from '@/lib/format';
import type { Coin } from '@/lib/types';
import { Change } from '../ui/Change';
import { Money } from '../ui/Money';

export function CoinPrice({ coin }: { coin: Coin }) {
  const t = useTranslations('coin');
  return (
    <div className="coin-head__price">
      <Money usd={coin.price} className="report__price" />
      <div className="coin-head__changes">
        {(
          [
            ['1h', coin.change1h],
            ['24h', coin.change24h],
            ['7d', coin.change7d],
          ] as const
        ).map(([period, value]) => (
          <span key={period} className="change-group">
            <span className="kicker" aria-hidden="true">
              {period}
            </span>
            <span className="sr-only">{t('changeLabel', { period })}</span>
            <Change value={value} chip />
          </span>
        ))}
      </div>
    </div>
  );
}

export function CoinFigures({ coin }: { coin: Coin }) {
  const t = useTranslations('coin');
  const locale = useLocale();
  const supply = (value: number | null) => (value == null ? '—' : `${formatNumber(value, locale)} ${coin.symbol}`);
  const fromAth = coin.ath && coin.price ? ((coin.price - coin.ath) / coin.ath) * 100 : null;

  return (
    <section className="panel" aria-labelledby="figures-title">
      <h2 id="figures-title" className="panel__title">
        {t('statsTitle')}
      </h2>
      <dl className="figures">
        <div>
          <dt>{t('marketCap')}</dt>
          <dd>
            <Money usd={coin.marketCap} compact />
          </dd>
        </div>
        <div>
          <dt>{t('volume')}</dt>
          <dd>
            <Money usd={coin.volume24h} compact />
          </dd>
        </div>
        <div>
          <dt>{t('high24h')}</dt>
          <dd>
            <Money usd={coin.high24h} />
          </dd>
        </div>
        <div>
          <dt>{t('low24h')}</dt>
          <dd>
            <Money usd={coin.low24h} />
          </dd>
        </div>
        <div>
          <dt>{t('ath')}</dt>
          <dd>
            <Money usd={coin.ath} />
          </dd>
        </div>
        <div>
          <dt>{t('athDate')}</dt>
          <dd suppressHydrationWarning>{formatDate(coin.athDate, locale, { dateStyle: 'medium' })}</dd>
        </div>
        <div>
          <dt>{t('fromAth')}</dt>
          <dd>
            <Change value={fromAth} />
          </dd>
        </div>
        <div>
          <dt>{t('circulating')}</dt>
          <dd suppressHydrationWarning>{supply(coin.circulatingSupply)}</dd>
        </div>
        <div>
          <dt>{t('total')}</dt>
          <dd suppressHydrationWarning>{supply(coin.totalSupply)}</dd>
        </div>
        <div>
          <dt>{t('max')}</dt>
          <dd suppressHydrationWarning>{coin.maxSupply ? supply(coin.maxSupply) : '∞'}</dd>
        </div>
      </dl>
    </section>
  );
}
