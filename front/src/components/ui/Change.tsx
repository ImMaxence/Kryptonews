import { useLocale } from 'next-intl';
import { formatPercent, trend } from '@/lib/format';

/** Percentage change: colour + arrow + explicit sign, so colour is never the only cue. */
export function Change({ value, chip = false }: { value: number | null | undefined; chip?: boolean }) {
  const locale = useLocale();
  const direction = trend(value);
  return (
    <span className={`change trend-${direction}${chip ? ' change--chip' : ''}`} suppressHydrationWarning>
      <span className="change__arrow" aria-hidden="true">
        {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '■'}
      </span>
      {formatPercent(value, locale)}
    </span>
  );
}
