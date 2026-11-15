'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo } from 'react';
import { intlLocale } from '@/lib/format';
import { usePrefs } from '../providers/PrefsProvider';

export function CurrencySelect({ label }: { label?: string }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const id = useId();
  const { currency, setCurrency, available, rates } = usePrefs();

  const names = useMemo(() => {
    let display: Intl.DisplayNames | null = null;
    try {
      display = new Intl.DisplayNames([intlLocale(locale)], { type: 'currency' });
    } catch {
      display = null;
    }
    return Object.fromEntries(
      available.map((code) => {
        const rateName = rates.find((r) => r.code === code)?.name;
        const name = code === 'btc' || code === 'eth' ? rateName : display?.of(code.toUpperCase());
        return [code, name ?? rateName ?? code.toUpperCase()];
      }),
    );
  }, [available, rates, locale]);

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label ?? t('currency')}
      </label>
      <select id={id} className="select" value={currency} onChange={(event) => setCurrency(event.target.value)}>
        {available.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()} · {names[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
