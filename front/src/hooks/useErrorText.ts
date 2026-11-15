'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { ApiError } from '@/lib/client-api';

/** Maps API error codes to translated sentences, with a generic fallback. */
export function useErrorText() {
  const t = useTranslations('errors');
  return useCallback(
    (error: unknown) => {
      const code = error instanceof ApiError ? error.code : 'server_error';
      return t.has(code as never) ? t(code as never) : t('server_error');
    },
    [t],
  );
}

/** Maps a zod issue code returned for a field to a translated hint. */
export function useFieldText() {
  const t = useTranslations('fields');
  return useCallback(
    (field: string, code: string | undefined) => {
      if (!code) return undefined;
      if (code === 'unsafe_url') return t('unsafeUrl');
      if (code === 'mismatch') return t('mismatch');
      if (field === 'email') return t('email');
      if (field === 'username') return t('username');
      if (field === 'password' || field === 'newPassword') return t('password');
      if (field === 'acceptTerms') return t('acceptTerms');
      if (field === 'firstName' || field === 'lastName') return t('personName');
      if (field === 'url') return t('url');
      if (code === 'too_small') return t('tooShort');
      if (code === 'too_big') return t('tooLong');
      return t('invalid');
    },
    [t],
  );
}
