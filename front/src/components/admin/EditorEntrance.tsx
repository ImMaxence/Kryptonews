import { getLocale, getTranslations } from 'next-intl/server';
import { GuestButton } from '../auth/GuestButton';
import { GoogleIcon, ScissorsIcon } from '../Icons';

/** Shown on the editor's desk URL to anyone who is not an editor: Google sign-in only. */
export async function EditorEntrance({ googleEnabled, error, reader }: { googleEnabled: boolean; error?: string; reader: boolean }) {
  const [t, tErrors, tAuth, locale] = await Promise.all([
    getTranslations('admin'),
    getTranslations('errors'),
    getTranslations('auth'),
    getLocale(),
  ]);
  const errorText = error && tErrors.has(error as never) ? tErrors(error as never) : null;

  return (
    <div className="wrap page">
      <div className="auth">
        <div className="auth__pitch">
          <p className="kicker kicker--accent">{t('entranceKicker')}</p>
          <h1 className="auth__title">{t('entranceTitle')}</h1>
          <p className="page-head__deck">{t('entranceBody')}</p>
        </div>
        <div className="coupon">
          <span className="coupon__scissors" aria-hidden="true">
            <ScissorsIcon />
            {tAuth('coupon')}
          </span>
          <div className="auth__form">
            {errorText && (
              <p className="form-alert" role="alert">
                {errorText}
              </p>
            )}
            {reader && (
              <p className="form-alert form-alert--info" role="note">
                {t('entranceReader')}
              </p>
            )}
            {googleEnabled ? (
              <a className="btn btn--oauth" href={`/api/auth/google?locale=${locale}`}>
                <span className="btn__logo">
                  <GoogleIcon />
                </span>
                {t('entranceGoogle')}
              </a>
            ) : (
              <p className="form-alert form-alert--info">{t('entranceNotConfigured')}</p>
            )}
            <div className="auth__guest">
              <p className="field__hint">{t('entranceDemo')}</p>
              <GuestButton className="btn btn--dashed" to="/admin" label={t('entranceDemoCta')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
