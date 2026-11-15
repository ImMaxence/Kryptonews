'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter as useNextRouter } from 'next/navigation';
import { useState } from 'react';
import { useErrorText } from '@/hooks/useErrorText';
import { useRouter } from '@/i18n/navigation';
import { send } from '@/lib/client-api';
import type { User } from '@/lib/types';
import { useSession } from '../providers/SessionProvider';
import { useToast } from '../providers/ToastProvider';

/** Opens the read-only demo session (fictional data) and lands on the clippings. */
export function GuestButton({
  className = 'btn',
  withHint = false,
  to = '/favorites',
  label,
}: {
  className?: string;
  withHint?: boolean;
  to?: '/favorites' | '/admin';
  label?: string;
}) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const nextRouter = useNextRouter();
  const toast = useToast();
  const errorText = useErrorText();
  const { setUser } = useSession();
  const [pending, setPending] = useState(false);

  const start = async () => {
    setPending(true);
    try {
      const { user } = await send<{ user: User }>('/api/auth/guest', { body: { locale } });
      setUser(user);
      router.push(to);
      nextRouter.refresh();
    } catch (error) {
      toast(errorText(error));
      setPending(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={start} disabled={pending} aria-busy={pending}>
        {label ?? t('guest')}
      </button>
      {withHint && <p className="field__hint">{t('guestHint')}</p>}
    </>
  );
}
