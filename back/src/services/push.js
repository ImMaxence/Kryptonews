import { createHash } from 'node:crypto';
import { Op } from 'sequelize';
import { WebPushError, generateVAPIDKeys, sendNotification, setVapidDetails } from 'web-push';
import { config } from '../config.js';
import { Article, Crypto, Favorite, PushSubscription, Rate, Setting } from '../db.js';
import { log } from '../lib/log.js';

/**
 * Opt-in Web Push notifications:
 *  - "market": a watched coin (or BTC/ETH by default) moves ±5% over 24h, at most twice a day per coin;
 *  - "digest": the morning edition, once a day around 8:00 (Paris time).
 * VAPID keys come from the environment, or are generated once and kept in the database.
 */
export const TOPICS = ['market', 'digest'];
const ALERT_THRESHOLD = 5;
const ALERT_COOLDOWN_MS = 12 * 3_600_000;
const DEFAULT_WATCH = ['bitcoin', 'ethereum'];

// Push services run by browser vendors. Endpoints are fetched server-side, so anything
// else is refused (an attacker could otherwise make the server call internal URLs).
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^web\.push\.apple\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/];

export function isAllowedEndpoint(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.port && PUSH_HOSTS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}

export const endpointHash = (endpoint) => createHash('sha1').update(endpoint).digest('hex');

let publicKey = null;

export async function initPush() {
  let keys = config.vapid.publicKey && config.vapid.privateKey ? { publicKey: config.vapid.publicKey, privateKey: config.vapid.privateKey } : null;
  if (!keys) {
    const stored = await Setting.findByPk('vapidKeys');
    keys = stored?.value?.publicKey ? stored.value : null;
    if (!keys) {
      keys = generateVAPIDKeys();
      await Setting.upsert({ key: 'vapidKeys', value: keys });
      log.info('Generated VAPID keys for Web Push');
    }
  }
  try {
    setVapidDetails(config.vapid.subject, keys.publicKey, keys.privateKey);
    publicKey = keys.publicKey;
  } catch (err) {
    // Notifications are optional: never let them stop the API.
    log.warn(`Web Push disabled: ${err.message}`);
    publicKey = null;
  }
}

export const getPublicKey = () => publicKey;

async function deliver(subscription, payload) {
  try {
    await sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
      { TTL: 6 * 3600, urgency: 'normal', timeout: 10_000 },
    );
    return true;
  } catch (err) {
    if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
      await subscription.destroy(); // expired or revoked by the browser
    } else {
      log.warn(`Push delivery failed (${err.statusCode ?? err.message})`);
    }
    return false;
  }
}

const PATHS = { en: { coin: '/en/markets/', home: '/en' }, fr: { coin: '/fr/marches/', home: '/fr' } };

async function priceFormatter(locale) {
  const currency = locale === 'fr' ? 'eur' : 'usd';
  const [usd, target] = await Promise.all([Rate.findByPk('usd'), Rate.findByPk(currency)]);
  const factor = usd && target ? target.valuePerBtc / usd.valuePerBtc : 1;
  const code = usd && target ? currency.toUpperCase() : 'USD';
  const nf = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: code, maximumSignificantDigits: 6 });
  return (value) => nf.format((value ?? 0) * factor);
}

const pct = (value, locale) =>
  new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'percent', signDisplay: 'exceptZero', maximumFractionDigits: 1 }).format(value / 100);

/** Market alerts for every subscriber with the "market" topic. */
export async function runMarketAlerts() {
  const subscriptions = (await PushSubscription.findAll()).filter((s) => s.topics.includes('market'));
  if (!subscriptions.length) return 0;
  const coins = new Map((await Crypto.findAll({ where: { listed: true } })).map((c) => [c.id, c]));
  const formatters = { en: await priceFormatter('en'), fr: await priceFormatter('fr') };
  let sent = 0;

  for (const subscription of subscriptions) {
    const watched = subscription.userId
      ? (await Favorite.findAll({ where: { userId: subscription.userId, kind: 'crypto' }, attributes: ['refId'], limit: 20 })).map((f) => f.refId)
      : [];
    const list = watched.length ? watched : DEFAULT_WATCH;
    const alerts = { ...subscription.alerts };
    const locale = subscription.locale === 'fr' ? 'fr' : 'en';
    let changed = false;
    let alive = true;

    for (const id of list) {
      const coin = coins.get(id);
      if (!coin || !Number.isFinite(coin.change24h) || Math.abs(coin.change24h) < ALERT_THRESHOLD) continue;
      if (alerts[id] && Date.now() - new Date(alerts[id]).getTime() < ALERT_COOLDOWN_MS) continue;
      const arrow = coin.change24h > 0 ? '▲' : '▼';
      const ok = await deliver(subscription, {
        title: `${coin.name} ${arrow} ${pct(coin.change24h, locale)} ${locale === 'fr' ? 'en 24 h' : 'in 24h'}`,
        body: `${locale === 'fr' ? 'Cours' : 'Price'} : ${formatters[locale](coin.price)} · Kryptonews`,
        url: `${PATHS[locale].coin}${coin.id}`,
        tag: `alert-${coin.id}`,
      });
      if (!ok) {
        alive = false; // revoked (deleted) or temporarily failing: stop for this subscriber
        break;
      }
      alerts[id] = new Date().toISOString();
      changed = true;
      sent += 1;
    }
    if (changed && alive) await subscription.update({ alerts });
  }
  return sent;
}

const parisHour = (date = new Date()) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(date));
const parisDay = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(date);

/** The morning edition, sent once per day after 8:00 Paris time. */
export async function runMorningEdition({ force = false } = {}) {
  if (!force && parisHour() < 8) return 0;
  const today = parisDay();
  const subscriptions = (await PushSubscription.findAll()).filter(
    (s) => s.topics.includes('digest') && (force || !s.lastDigestAt || parisDay(s.lastDigestAt) !== today),
  );
  if (!subscriptions.length) return 0;

  const [btc, eth] = await Promise.all([Crypto.findByPk('bitcoin'), Crypto.findByPk('ethereum')]);
  const headlines = {
    en: await Article.findOne({ where: { lang: 'en', publishedAt: { [Op.gte]: new Date(Date.now() - 86_400_000) } }, order: [['publishedAt', 'DESC']] }),
    fr: await Article.findOne({ where: { lang: 'fr', publishedAt: { [Op.gte]: new Date(Date.now() - 86_400_000) } }, order: [['publishedAt', 'DESC']] }),
  };
  const formatters = { en: await priceFormatter('en'), fr: await priceFormatter('fr') };
  let sent = 0;

  for (const subscription of subscriptions) {
    const locale = subscription.locale === 'fr' ? 'fr' : 'en';
    const prices = [btc, eth]
      .filter(Boolean)
      .map((c) => `${c.symbol} ${formatters[locale](c.price)} (${pct(c.change24h ?? 0, locale)})`)
      .join(' · ');
    const headline = headlines[locale] ?? headlines.en;
    const ok = await deliver(subscription, {
      title: locale === 'fr' ? 'L’édition du matin · Kryptonews' : 'The morning edition · Kryptonews',
      body: headline ? `${prices}\n${headline.title}` : prices,
      url: PATHS[locale].home,
      tag: 'morning-edition',
    });
    if (ok) {
      await subscription.update({ lastDigestAt: new Date() });
      sent += 1;
    }
  }
  return sent;
}
