'use client';

import { useLocale } from 'next-intl';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CURRENCIES, convertUsd, formatMoney } from '@/lib/format';
import type { Rate } from '@/lib/types';

interface PrefsValue {
  currency: string;
  setCurrency: (code: string) => void;
  rates: Rate[];
  available: string[];
  /** Converts a USD amount to the selected currency and formats it. */
  money: (usd: number | null | undefined, opts?: { compact?: boolean }) => string;
  convert: (usd: number | null | undefined) => number | null;
}

const PrefsContext = createContext<PrefsValue | null>(null);

export function PrefsProvider({ initialCurrency, rates, children }: { initialCurrency: string; rates: Rate[]; children: ReactNode }) {
  const locale = useLocale();
  const available = useMemo(
    () => CURRENCIES.filter((code) => code === 'usd' || rates.some((r) => r.code === code)),
    [rates],
  );
  const [currency, setCurrencyState] = useState(available.includes(initialCurrency as never) ? initialCurrency : 'usd');

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    // Functional preference cookie, so server-rendered prices match on the next visit.
    const secure = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `kn_currency=${code}; path=/; max-age=31536000; samesite=lax${secure}`;
  }, []);

  const convert = useCallback((usd: number | null | undefined) => convertUsd(usd, currency, rates), [currency, rates]);

  const money = useCallback(
    (usd: number | null | undefined, opts?: { compact?: boolean }) => {
      const value = convertUsd(usd, currency, rates);
      return value == null ? '—' : formatMoney(value, currency, locale, opts);
    },
    [currency, rates, locale],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, rates, available: [...available], money, convert }),
    [currency, setCurrency, rates, available, money, convert],
  );
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const value = useContext(PrefsContext);
  if (!value) throw new Error('usePrefs must be used inside PrefsProvider');
  return value;
}
