'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatNumber } from '@/lib/format';
import type { Coin, MarketSummary, Mover } from '@/lib/types';
import { ArrowRightIcon } from '../Icons';
import { Change } from '../ui/Change';
import { CoinLabel } from '../ui/CoinLabel';
import { Money } from '../ui/Money';
import { Sparkline } from '../ui/Sparkline';

function MoverList({ items }: { items: Mover[] }) {
  return (
    <ul className="report__list">
      {items.map((coin) => (
        <li key={coin.id}>
          <CoinLabel id={coin.id} name={coin.name} symbol={coin.symbol} image={coin.image} />
          <span className="report__figures">
            <Money usd={coin.price} />
            <Change value={coin.change24h} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Right-hand rail of the front page: headline prices, movers, market-wide figures. */
export function MarketReport({ leaders, summary }: { leaders: Coin[]; summary: MarketSummary }) {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <>
      <section aria-labelledby="report-title">
        <div className="section-head">
          <h2 id="report-title">{t('marketReport')}</h2>
        </div>
        {leaders.map((coin) => (
          <div key={coin.id} className="report__headline">
            <CoinLabel id={coin.id} name={coin.name} symbol={coin.symbol} image={coin.image} />
            <Money usd={coin.price} className="report__price" />
            <Change value={coin.change24h} />
            <Sparkline data={coin.sparkline} change={coin.change7d} width={280} height={42} />
          </div>
        ))}
        <dl className="figures">
          <div>
            <dt>{t('totalCap')}</dt>
            <dd>
              <Money usd={summary.totalMarketCap} compact />
            </dd>
          </div>
          <div>
            <dt>{t('btcDominance')}</dt>
            <dd suppressHydrationWarning>
              {summary.btcDominance == null ? '—' : `${formatNumber(summary.btcDominance, locale, { maximumFractionDigits: 1 })} %`}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="movers-title">
        <div className="section-head">
          <h2 id="movers-title">{t('movers')}</h2>
        </div>
        <h3 className="kicker report__sub">{t('gainers')}</h3>
        <MoverList items={summary.gainers} />
        <h3 className="kicker report__sub">{t('losers')}</h3>
        <MoverList items={summary.losers} />
        <p style={{ marginTop: '1.25rem' }}>
          <Link href="/markets" className="btn btn--small">
            {t('seeMarkets')} <ArrowRightIcon width={16} height={16} />
          </Link>
        </p>
      </section>
    </>
  );
}
