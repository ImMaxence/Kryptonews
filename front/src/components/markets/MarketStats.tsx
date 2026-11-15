'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/format';
import type { MarketSummary } from '@/lib/types';
import { Money } from '../ui/Money';

export function MarketStats({ summary }: { summary: MarketSummary }) {
  const t = useTranslations('markets');
  const locale = useLocale();
  return (
    <dl className="stats-strip" aria-label={t('statsLabel')}>
      <div>
        <dt>{t('totalCap')}</dt>
        <dd>
          <Money usd={summary.totalMarketCap} compact />
        </dd>
      </div>
      <div>
        <dt>{t('totalVolume')}</dt>
        <dd>
          <Money usd={summary.totalVolume} compact />
        </dd>
      </div>
      <div>
        <dt>{t('dominance')}</dt>
        <dd suppressHydrationWarning>
          {summary.btcDominance == null ? '—' : `${formatNumber(summary.btcDominance, locale, { maximumFractionDigits: 1 })} %`}
        </dd>
      </div>
      <div>
        <dt>{t('breadth')}</dt>
        <dd>
          <span className="trend-up">▲ {summary.up}</span> <span className="trend-down">▼ {summary.down}</span>
          <span className="sr-only">{t('breadthValue', { up: summary.up, down: summary.down })}</span>
        </dd>
      </div>
    </dl>
  );
}
