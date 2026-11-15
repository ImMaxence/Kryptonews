'use client';

import { usePrefs } from '../providers/PrefsProvider';

/** A USD amount displayed in the reader's currency. */
export function Money({ usd, compact, className }: { usd: number | null | undefined; compact?: boolean; className?: string }) {
  const { money } = usePrefs();
  return (
    <span className={className} suppressHydrationWarning>
      {money(usd, { compact })}
    </span>
  );
}
