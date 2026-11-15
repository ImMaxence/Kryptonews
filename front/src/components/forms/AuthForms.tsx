'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter as useNextRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useErrorText, useFieldText } from '@/hooks/useErrorText';
import { useSignupProof } from '@/hooks/useSignupProof';
import { Link, useRouter } from '@/i18n/navigation';
import { ApiError, send } from '@/lib/client-api';
import type { User } from '@/lib/types';
import { GuestButton } from '../auth/GuestButton';
import { GoogleIcon } from '../Icons';
import { useSession } from '../providers/SessionProvider';
import { Field, FormAlert, PasswordInput, describedBy } from './Field';

/** Only same-site paths are allowed as post-login destinations (no open redirect). */
const safeNext = (value: string | undefined) => (value && /^\/(?!\/)[\w\-./?=&%]*$/.test(value) ? value : null);

function GuestOption() {
  return (
    <div className="auth__guest">
      <GuestButton className="btn btn--dashed" withHint />
    </div>
  );
}

function useAfterAuth(next?: string) {
  const router = useRouter();
  const nextRouter = useNextRouter();
  const { setUser } = useSession();
  return (user: User) => {
    setUser(user);
    const target = safeNext(next);
    // A temporary password sent by the editors: go straight to choosing one's own.
    if (user.mustChangePassword) router.replace('/account');
    else if (target) nextRouter.replace(target);
    else router.replace('/');
    nextRouter.refresh();
  };
}

/** Google sign-in for the editors (the API refuses any address not listed in ADMIN_EMAILS). */
function EditorsGoogle() {
  const t = useTranslations('auth');
  const locale = useLocale();
  return (
    <div className="auth__editors">
      <p className="auth__divider">{t('or')}</p>
      <a className="btn btn--oauth" href={`/api/auth/google?locale=${locale}`} aria-describedby="login-editors-hint">
        <span className="btn__logo">
          <GoogleIcon />
        </span>
        {t('editorsGoogle')}
      </a>
      <p id="login-editors-hint" className="field__hint">
        {t('editorsGoogleHint')}
      </p>
    </div>
  );
}

export function LoginForm({ next, initialError, google = false }: { next?: string; initialError?: string; google?: boolean }) {
  const t = useTranslations('auth');
  const tReset = useTranslations('reset');
  const tErrors = useTranslations('errors');
  const errorText = useErrorText();
  const afterAuth = useAfterAuth(next);
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string | null>(
    initialError && tErrors.has(initialError as never) ? tErrors(initialError as never) : null,
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setAlert(null);
    try {
      const { user } = await send<{ user: User }>('/api/auth/login', {
        body: { identifier: String(data.get('identifier') ?? ''), password: String(data.get('password') ?? '') },
      });
      afterAuth(user);
    } catch (error) {
      setAlert(errorText(error));
      setPending(false);
    }
  };

  return (
    <div className="auth__form">
      <form method="post" className="auth__form" onSubmit={onSubmit} noValidate={false}>
        <FormAlert message={alert} />
        <Field id="login-identifier" label={t('identifier')}>
          <input {...describedBy('login-identifier', {})} name="identifier" type="email" className="input" autoComplete="email" required maxLength={254} />
        </Field>
        <Field id="login-password" label={t('password')}>
          <PasswordInput id="login-password" name="password" autoComplete="current-password" required maxLength={128} />
        </Field>
        <p className="auth__forgot">
          <Link href="/reset-password">{tReset('forgotLink')}</Link>
        </p>
        <button type="submit" className="btn btn--solid" disabled={pending} aria-busy={pending}>
          {t('loginSubmit')}
        </button>
      </form>
      {google && <EditorsGoogle />}
      <p className="auth__switch">
        {t('noAccount')} <Link href="/register">{t('registerLink')}</Link>
      </p>
      <GuestOption />
    </div>
  );
}

/** Same rule as the API: letters, then letters, spaces, apostrophes, dots or hyphens. */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

/**
 * Access request: readers do not create accounts themselves. They leave their name and
 * email; an editor reviews the request and emails them their login details.
 */
export function AccessRequestForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const errorText = useErrorText();
  const fieldText = useFieldText();
  const { config } = useSession();
  const proof = useSignupProof();
  const [pending, setPending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sent, setSent] = useState<{ firstName: string; email: string } | null>(null);
  const sentTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) sentTitle.current?.focus();
  }, [sent]);

  if (config && config.signupsOpen === false) {
    return (
      <div className="auth__form">
        <p className="form-alert form-alert--info">{t('signupsClosed')}</p>
        <p className="auth__switch">
          {t('haveAccount')} <Link href="/login">{t('loginLink')}</Link>
        </p>
        <GuestOption />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="auth__form">
        <h2 ref={sentTitle} tabIndex={-1} className="coupon__title">
          {t('requestSentTitle')}
        </h2>
        <p>{t('requestSentBody', sent)}</p>
        <p className="field__hint">{t('requestSentGuest')}</p>
        <GuestOption />
      </div>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = {
      firstName: String(data.get('firstName') ?? '').trim(),
      lastName: String(data.get('lastName') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      acceptTerms: data.get('acceptTerms') === 'on',
      locale,
      // Honeypot: invisible to people, filled in by naive bots.
      ...(data.get('website') ? { website: String(data.get('website')) } : {}),
    };

    const local: Record<string, string | undefined> = {};
    for (const field of ['firstName', 'lastName'] as const) {
      if (!body[field] || body[field].length > 60 || !NAME_PATTERN.test(body[field])) local[field] = fieldText(field, 'invalid');
    }
    if (!/^\S+@\S+\.\S+$/.test(body.email)) local.email = fieldText('email', 'invalid');
    if (!body.acceptTerms) local.acceptTerms = fieldText('acceptTerms', 'invalid');
    setErrors(local);
    if (Object.keys(local).length) {
      setAlert(errorText(new ApiError(400, 'validation')));
      return;
    }

    setPending(true);
    setAlert(null);
    try {
      setVerifying(true);
      const pow = await proof.take();
      setVerifying(false);
      await send('/api/auth/access-request', { body: { ...body, pow } });
      setSent({ firstName: body.firstName, email: body.email });
    } catch (error) {
      setVerifying(false);
      proof.warm(); // each proof is single-use: prepare the next attempt
      if (error instanceof ApiError && error.fields) {
        setErrors(Object.fromEntries(Object.entries(error.fields).map(([field, code]) => [field, fieldText(field, code)])));
      }
      setAlert(errorText(error));
      setPending(false);
    }
  };

  return (
    <div className="auth__form">
      <form method="post" className="auth__form" onSubmit={onSubmit} onFocus={proof.warm} noValidate>
        <FormAlert message={alert} />
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="reg-website">Website</label>
          <input id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="auth__names">
          <Field id="reg-first" label={t('firstName')} error={errors.firstName}>
            <input {...describedBy('reg-first', { error: errors.firstName })} name="firstName" className="input" autoComplete="given-name" required maxLength={60} />
          </Field>
          <Field id="reg-last" label={t('lastName')} error={errors.lastName}>
            <input {...describedBy('reg-last', { error: errors.lastName })} name="lastName" className="input" autoComplete="family-name" required maxLength={60} />
          </Field>
        </div>
        <Field id="reg-email" label={t('email')} hint={t('emailHint')} error={errors.email}>
          <input {...describedBy('reg-email', { hint: true, error: errors.email })} name="email" type="email" className="input" autoComplete="email" required maxLength={254} />
        </Field>
        <div className="field">
          <label className="checkbox">
            <input type="checkbox" name="acceptTerms" required aria-invalid={errors.acceptTerms ? true : undefined} aria-describedby={errors.acceptTerms ? 'reg-terms-error' : undefined} />
            <span>
              {t.rich('acceptTerms', {
                terms: (chunks) => (
                  <Link href="/terms" target="_blank">
                    {chunks}
                    <span className="sr-only"> {tCommon('opensInNewTab')}</span>
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link href="/privacy" target="_blank">
                    {chunks}
                    <span className="sr-only"> {tCommon('opensInNewTab')}</span>
                  </Link>
                ),
              })}
            </span>
          </label>
          {errors.acceptTerms && (
            <p id="reg-terms-error" className="field__error">
              {errors.acceptTerms}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn--solid" disabled={pending} aria-busy={pending}>
          {verifying ? t('verifying') : t('registerSubmit')}
        </button>
        <p className="field__hint auth__proof" role="status">
          {verifying ? t('verifyingHint') : ''}
        </p>
      </form>
      <p className="auth__switch">
        {t('haveAccount')} <Link href="/login">{t('loginLink')}</Link>
      </p>
      <GuestOption />
    </div>
  );
}
