import { Op } from 'sequelize';
import { config } from '../config.js';
import { AccessRequest, User } from '../db.js';
import { log } from '../lib/log.js';
import { syncMarkets, syncRates } from './coingecko.js';
import { pruneArticles, syncNews } from './news.js';
import { runMarketAlerts, runMorningEdition } from './push.js';

const timers = [];

/** Runs `fn` now-ish and then every `ms`, never overlapping with itself. */
function every(name, ms, fn, initialDelay = 0) {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    const started = Date.now();
    try {
      const result = await fn();
      log.info(`[job:${name}] ok${result !== undefined ? ` (${result})` : ''} in ${Date.now() - started} ms`);
    } catch (err) {
      log.warn(`[job:${name}] failed: ${err.message}`);
    } finally {
      running = false;
    }
  };
  timers.push(setTimeout(run, initialDelay), setInterval(run, ms));
  return run;
}

async function housekeeping() {
  const pruned = await pruneArticles();
  const cutoff = new Date(Date.now() - config.inactiveAccountYears * 365 * 86_400_000);
  // GDPR storage limitation: remove accounts unused for N years (admins are kept).
  const removed = await User.destroy({
    where: {
      role: 'user',
      [Op.or]: [
        { lastLoginAt: { [Op.lt]: cutoff } },
        { lastLoginAt: null, createdAt: { [Op.lt]: cutoff } },
      ],
    },
  });
  // Requests nobody answered are dropped after PENDING_REQUEST_DAYS (storage limitation).
  const expired = await AccessRequest.destroy({
    where: { createdAt: { [Op.lt]: new Date(Date.now() - config.signup.pendingDays * 86_400_000) } },
  });
  return `${pruned} old articles, ${removed} inactive accounts, ${expired} expired access requests`;
}

export const jobs = {};

export function startScheduler() {
  jobs.markets = every('markets', config.intervals.marketsMs, syncMarkets, 0);
  jobs.news = every('news', config.intervals.newsMs, syncNews, 1_500);
  jobs.rates = every('rates', config.intervals.ratesMs, syncRates, 4_000);
  jobs.housekeeping = every('housekeeping', config.intervals.housekeepingMs, housekeeping, 60_000);
  // Notifications: checked every 10 minutes, after the market data has been refreshed.
  jobs.notifications = every('notifications', 10 * 60_000, async () => `${await runMarketAlerts()} alerts, ${await runMorningEdition()} digests`, 90_000);
}

export function stopScheduler() {
  for (const timer of timers) {
    clearTimeout(timer);
    clearInterval(timer);
  }
  timers.length = 0;
}
