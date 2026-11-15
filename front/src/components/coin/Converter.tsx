'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { intlLocale } from '@/lib/format';
import { CurrencySelect } from '../markets/CurrencySelect';
import { usePrefs } from '../providers/PrefsProvider';

const parse = (value: string) => {
  const n = Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Two-way coin ⇄ currency converter using the live price and the selected currency. */
export function Converter({ symbol, priceUsd }: { symbol: string; priceUsd: number | null }) {
  const t = useTranslations('coin');
  const locale = useLocale();
  const { convert, currency } = usePrefs();
  const coinId = useId();
  const fiatId = useId();
  const [edited, setEdited] = useState<'coin' | 'fiat'>('coin');
  const [coinValue, setCoinValue] = useState('1');
  const [fiatValue, setFiatValue] = useState('');

  const unit = convert(priceUsd);
  const fmt = (value: number | null, digits: number) =>
    value == null || unit == null
      ? ''
      : new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: digits, useGrouping: false }).format(value);

  const coinShown = edited === 'coin' ? coinValue : fmt(unit && parse(fiatValue) != null ? parse(fiatValue)! / unit : null, 8);
  const fiatShown =
    edited === 'fiat'
      ? fiatValue
      : fmt(unit != null && parse(coinValue) != null ? parse(coinValue)! * unit : null, currency === 'btc' || currency === 'eth' ? 8 : 2);

  return (
    <section className="panel" aria-labelledby="converter-title">
      <h2 id="converter-title" className="panel__title">
        {t('converterTitle')}
      </h2>
      <div className="converter">
        <div className="field">
          <label htmlFor={coinId} className="field__label">
            {t('amountIn', { unit: symbol })}
          </label>
          <input
            id={coinId}
            className="input mono"
            inputMode="decimal"
            autoComplete="off"
            value={coinShown}
            onChange={(event) => {
              setEdited('coin');
              setCoinValue(event.target.value);
            }}
          />
        </div>
        <span className="converter__swap" aria-hidden="true">
          ⇅
        </span>
        <div className="field">
          <label htmlFor={fiatId} className="field__label">
            {t('amountIn', { unit: currency.toUpperCase() })}
          </label>
          <input
            id={fiatId}
            className="input mono"
            inputMode="decimal"
            autoComplete="off"
            value={fiatShown}
            onChange={(event) => {
              setEdited('fiat');
              setFiatValue(event.target.value);
            }}
          />
        </div>
        <CurrencySelect />
      </div>
    </section>
  );
}
