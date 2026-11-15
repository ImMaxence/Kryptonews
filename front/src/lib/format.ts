import type { Rate } from './types';

const LOCALE_TAGS = { en: 'en-US', fr: 'fr-FR' } as const;
export const intlLocale = (locale: string) => LOCALE_TAGS[locale as keyof typeof LOCALE_TAGS] ?? 'en-US';

/** Currencies offered in the selector, in display order. Crypto units are shown as codes. */
export const CURRENCIES = ['usd', 'eur', 'gbp', 'chf', 'cad', 'aud', 'jpy', 'cny', 'inr', 'brl', 'krw', 'btc', 'eth'] as const;
const CRYPTO_UNITS = new Set(['btc', 'eth']);

export const defaultCurrency = (locale: string) => (locale === 'fr' ? 'eur' : 'usd');

export function convertUsd(value: number | null | undefined, currency: string, rates: Rate[]) {
  if (value == null || !Number.isFinite(value)) return null;
  if (currency === 'usd') return value;
  const rate = rates.find((r) => r.code === currency);
  return rate ? value * rate.perUsd : null;
}

const cache = new Map<string, Intl.NumberFormat>();
function nf(locale: string, options: Intl.NumberFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocale(locale), options);
    cache.set(key, formatter);
  }
  return formatter;
}

/** Price with adaptive precision: 2 decimals above 1, more for small values. */
export function formatMoney(value: number | null, currency: string, locale: string, opts: { compact?: boolean } = {}) {
  if (value == null || !Number.isFinite(value)) return '—';
  const code = currency.toUpperCase();
  const isCrypto = CRYPTO_UNITS.has(currency);
  const abs = Math.abs(value);
  const base: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: code,
    currencyDisplay: isCrypto ? 'code' : 'narrowSymbol',
  };
  if (opts.compact) return nf(locale, { ...base, notation: 'compact', maximumFractionDigits: 2 }).format(value);
  if (isCrypto) return nf(locale, { ...base, maximumSignificantDigits: 6 }).format(value);
  if (abs >= 1) return nf(locale, { ...base, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  if (abs >= 0.01) return nf(locale, { ...base, minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value);
  return nf(locale, { ...base, maximumSignificantDigits: 4 }).format(value);
}

export function formatPercent(value: number | null | undefined, locale: string) {
  if (value == null || !Number.isFinite(value)) return '—';
  return nf(locale, {
    style: 'percent',
    signDisplay: 'exceptZero',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number | null | undefined, locale: string, opts: Intl.NumberFormatOptions = {}) {
  if (value == null || !Number.isFinite(value)) return '—';
  return nf(locale, { maximumFractionDigits: 0, ...opts }).format(value);
}

export function formatDate(value: string | Date | null | undefined, locale: string, opts: Intl.DateTimeFormatOptions = {}) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: 'Europe/Paris', ...opts }).format(date);
}

export function formatRelative(value: string | Date, locale: string, now = Date.now()) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto', style: 'short' });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86_400) return rtf.format(Math.round(seconds / 86_400), 'day');
  return formatDate(date, locale, { day: 'numeric', month: 'short' });
}

export const trend = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value) || value === 0 ? 'flat' : value > 0 ? 'up' : 'down';
