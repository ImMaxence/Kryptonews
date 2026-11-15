import { trend } from '@/lib/format';

/** Decorative 7-day sparkline (the figures it summarises are in the table). */
export function Sparkline({ data, width = 120, height = 36, change }: { data: number[]; width?: number; height?: number; change?: number | null }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const d = data
    .map((value, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - ((value - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(' ');
  const direction = trend(change ?? data[data.length - 1] - data[0]);

  return (
    <svg className={`sparkline trend-${direction}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}
