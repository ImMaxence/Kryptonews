'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetcher, send } from '@/lib/client-api';
import { getRegistration, urlBase64ToUint8Array, useInstallPrompt } from '@/lib/pwa';
import { BellIcon } from '../Icons';
import { FormAlert } from '../forms/Field';
import { useToast } from '../providers/ToastProvider';
import { Dialog } from '../ui/Dialog';

type Topic = 'market' | 'digest';
type Support = 'checking' | 'ok' | 'ios' | 'unsupported';

/**
 * Bell in the masthead: opt-in push notifications (market alerts, morning edition)
 * and "install the app". The browser permission is only requested on an explicit click.
 */
export function NotificationsButton() {
  const t = useTranslations('notify');
  const locale = useLocale();
  const toast = useToast();
  const { install, installed } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const [support, setSupport] = useState<Support>('checking');
  const [subscribed, setSubscribed] = useState(false);
  const [topics, setTopics] = useState<Topic[]>(['market', 'digest']);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAlert(null);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!ok) {
      setSupport(ios && !standalone ? 'ios' : 'unsupported');
      return;
    }
    setSupport('ok');
    if (Notification.permission === 'denied') setAlert(t('denied'));
    void (async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) return setSubscribed(false);
      const status = await send<{ subscribed: boolean; topics: Topic[] }>('/api/push/status', { body: { endpoint: subscription.endpoint } });
      setSubscribed(status.subscribed);
      if (status.topics.length) setTopics(status.topics);
    })().catch(() => undefined);
  }, [open, t]);

  const toggleTopic = (topic: Topic) =>
    setTopics((current) => (current.includes(topic) ? current.filter((x) => x !== topic) : [...current, topic]));

  const subscribe = async () => {
    if (!topics.length) return setAlert(t('pickOne'));
    setBusy(true);
    setAlert(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setAlert(t('denied'));
        return;
      }
      const registration = await getRegistration();
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const { publicKey } = await fetcher<{ publicKey: string }>('/api/push/public-key');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      await send('/api/push/subscribe', { body: { subscription: subscription.toJSON(), topics, locale } });
      toast(subscribed ? t('saved') : t('enabled'));
      setSubscribed(true);
    } catch {
      setAlert(t('error'));
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await send('/api/push/unsubscribe', { body: { endpoint: subscription.endpoint } }).catch(() => undefined);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      toast(t('disabled'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="tool-link" aria-label={t('button')} title={t('button')} onClick={() => setOpen(true)}>
        <BellIcon />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t('title')}>
        {/* Rendered only when open: its content depends on browser-only state. */}
        {open && (
        <div className="stack notify">
          <p>{t('intro')}</p>
          <FormAlert message={alert} />

          {support === 'ios' && <p className="form-alert form-alert--info">{t('ios')}</p>}
          {support === 'unsupported' && <p className="form-alert form-alert--info">{t('unsupported')}</p>}

          {support === 'ok' && (
            <>
              <fieldset className="notify__topics">
                <legend className="field__label">
                  {t('typesLabel')}{' '}
                  <span className={`badge ${subscribed ? 'badge--ok' : ''}`}>{subscribed ? t('statusOn') : t('statusOff')}</span>
                </legend>
                {(['market', 'digest'] as const).map((topic) => (
                  <label key={topic} className="checkbox">
                    <input type="checkbox" checked={topics.includes(topic)} onChange={() => toggleTopic(topic)} />
                    <span>
                      <strong>{t(topic)}</strong>
                      <span className="field__hint notify__hint">{t(`${topic}Hint`)}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="dialog__actions notify__actions">
                {subscribed && (
                  <button type="button" className="btn btn--ghost" onClick={unsubscribe} disabled={busy}>
                    {t('disable')}
                  </button>
                )}
                <button type="button" className="btn btn--solid" onClick={subscribe} disabled={busy} aria-busy={busy}>
                  {subscribed ? t('update') : t('enable')}
                </button>
              </div>
            </>
          )}

          <section className="notify__install" aria-labelledby="install-title">
            <h3 id="install-title" className="panel__title">
              {t('installTitle')}
            </h3>
            {installed ? (
              <p>{t('installed')}</p>
            ) : (
              <>
                <p>{t('installBody')}</p>
                {install ? (
                  <button type="button" className="btn" onClick={install}>
                    {t('install')}
                  </button>
                ) : (
                  /iphone|ipad|ipod/i.test(navigator.userAgent) && <p className="field__hint">{t('ios')}</p>
                )}
              </>
            )}
          </section>
        </div>
        )}
      </Dialog>
    </>
  );
}
