'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/client-api';
import { formatDate, formatMoney, formatPercent } from '@/lib/format';
import type { HistoryRange, HistoryResponse } from '@/lib/types';
import { usePrefs } from '../providers/PrefsProvider';

const RANGES: HistoryRange[] = ['1d', '7d', '30d', '1y'];
const PAD = { top: 18, right: 78, bottom: 30, left: 6 };

function tickLabel(ts: number, range: HistoryRange, locale: string) {
  if (range === '1d') return formatDate(new Date(ts), locale, { hour: '2-digit', minute: '2-digit' });
  if (range === '1y') return formatDate(new Date(ts), locale, { month: 'short', year: '2-digit' });
  return formatDate(new Date(ts), locale, { day: 'numeric', month: 'short' });
}

export function PriceChart({ coinId, name }: { coinId: string; name: string }) {
  const t = useTranslations('coin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { convert, currency } = usePrefs();
  const hatchId = useId().replace(/:/g, '');
  const summaryId = useId();
  const frameRef = useRef<HTMLDivElement>(null);

  const [range, setRange] = useState<HistoryRange>('7d');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');

  const { data, error, isLoading, mutate } = useSWR<HistoryResponse>(
    `/api/cryptos/${encodeURIComponent(coinId)}/history?range=${range}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false },
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const points = useMemo(
    () => (data?.prices ?? []).map(([ts, usd]) => ({ ts, value: convert(usd) ?? usd })),
    [data, convert],
  );

  const geometry = useMemo(() => {
    if (points.length < 2 || size.width === 0) return null;
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || max * 0.01 || 1;
    const yMin = min - spread * 0.08;
    const yMax = max + spread * 0.08;
    const t0 = points[0].ts;
    const t1 = points[points.length - 1].ts;
    const innerW = size.width - PAD.left - PAD.right;
    const innerH = size.height - PAD.top - PAD.bottom;
    const x = (ts: number) => PAD.left + ((ts - t0) / (t1 - t0 || 1)) * innerW;
    const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.ts).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
    const bottom = PAD.top + innerH;
    const area = `${line} L${x(t1).toFixed(1)},${bottom} L${x(t0).toFixed(1)},${bottom} Z`;
    const compact = max >= 10_000;
    const yTicks = [0.15, 0.5, 0.85].map((f) => {
      const value = yMin + (yMax - yMin) * (1 - f);
      return { y: PAD.top + innerH * f, label: formatMoney(value, currency, locale, { compact }) };
    });
    const xTicks = [0, 1 / 3, 2 / 3, 1].map((f) => {
      const ts = t0 + (t1 - t0) * f;
      const anchor: 'start' | 'middle' | 'end' = f === 0 ? 'start' : f === 1 ? 'end' : 'middle';
      return { x: x(ts), label: tickLabel(ts, range, locale), anchor };
    });
    return { x, y, line, area, yTicks, xTicks, min, max, bottom, innerW };
  }, [points, size, currency, locale, range]);

  const describe = (index: number) => {
    const point = points[index];
    return t('chartPoint', {
      date: formatDate(new Date(point.ts), locale, { dateStyle: 'medium', timeStyle: range === '1y' ? undefined : 'short' }),
      price: formatMoney(point.value, currency, locale),
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!geometry) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    let best = 0;
    let bestDistance = Infinity;
    points.forEach((p, i) => {
      const distance = Math.abs(geometry.x(p.ts) - px);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    setActive(best);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!points.length) return;
    const last = points.length - 1;
    let next: number | null = active;
    if (event.key === 'ArrowRight') next = active == null ? last : Math.min(last, active + 1);
    else if (event.key === 'ArrowLeft') next = active == null ? last : Math.max(0, active - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else if (event.key === 'Escape') next = null;
    else return;
    event.preventDefault();
    setActive(next);
    setAnnounce(next == null ? '' : describe(next));
  };

  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  const summary =
    geometry && first != null && last != null
      ? t('chartSummary', {
          name,
          start: formatMoney(first, currency, locale),
          end: formatMoney(last, currency, locale),
          change: formatPercent(((last - first) / first) * 100, locale),
          high: formatMoney(geometry.max, currency, locale),
          low: formatMoney(geometry.min, currency, locale),
        })
      : '';

  const activePoint = active != null && geometry ? points[active] : null;
  const activeX = activePoint && geometry ? geometry.x(activePoint.ts) : 0;

  return (
    <section className="chart" aria-labelledby="chart-title">
      <div className="chart__head">
        <h2 id="chart-title" className="kicker">
          {t('chartTitle')}
        </h2>
        <div className="segmented" role="group" aria-label={t('rangeLabel')}>
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              onClick={() => {
                setRange(value);
                setActive(null);
              }}
            >
              {t(`range.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={frameRef}
        className="chart__frame"
        tabIndex={0}
        role="img"
        aria-roledescription="chart"
        aria-label={`${t('chartTitle')}: ${name}. ${t('chartKeyboard')}`}
        aria-describedby={summaryId}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        {geometry && (
          <svg className="chart__svg" width={size.width} height={size.height} aria-hidden="true" focusable="false">
            <defs>
              <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)" className="chart__hatch">
                <line x1="0" y1="0" x2="0" y2="6" />
              </pattern>
            </defs>
            <g className="chart__grid">
              {geometry.yTicks.map((tick) => (
                <line key={tick.y} x1={PAD.left} x2={size.width - PAD.right + 6} y1={tick.y} y2={tick.y} />
              ))}
            </g>
            <path d={geometry.area} fill={`url(#${hatchId})`} />
            <path d={geometry.line} className="chart__line" />
            <g className="chart__axis">
              {geometry.yTicks.map((tick) => (
                <text key={tick.y} x={size.width - PAD.right + 10} y={tick.y + 4}>
                  {tick.label}
                </text>
              ))}
              {geometry.xTicks.map((tick) => (
                <text key={tick.x} x={tick.x} y={geometry.bottom + 20} textAnchor={tick.anchor}>
                  {tick.label}
                </text>
              ))}
            </g>
            {activePoint && (
              <>
                <line className="chart__cursor" x1={activeX} x2={activeX} y1={PAD.top} y2={geometry.bottom} />
                <circle className="chart__dot" cx={activeX} cy={geometry.y(activePoint.value)} r={5} />
              </>
            )}
          </svg>
        )}

        {activePoint && (
          <div className="chart__tooltip" style={{ left: Math.min(Math.max(activeX, 70), size.width - 70) }} aria-hidden="true">
            <span>{formatDate(new Date(activePoint.ts), locale, { dateStyle: 'medium', timeStyle: range === '1y' ? undefined : 'short' })}</span>
            <strong>{formatMoney(activePoint.value, currency, locale)}</strong>
          </div>
        )}

        {!geometry && (
          <div className="chart__state">
            {error ? (
              <div>
                <p>{t('chartError')}</p>
                <button type="button" className="btn btn--small" style={{ marginTop: '0.75rem' }} onClick={() => mutate()}>
                  {tCommon('retry')}
                </button>
              </div>
            ) : isLoading || size.width === 0 ? (
              <p>{t('chartLoading')}</p>
            ) : (
              <p>{t('chartError')}</p>
            )}
          </div>
        )}
      </div>

      <p id={summaryId} className="chart__caption">
        {summary}
      </p>
      {currency !== 'usd' && <p className="chart__note">{t('fxNote')}</p>}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}
