import { Op } from 'sequelize';
import { config } from '../config.js';
import { Crypto, Rate } from '../db.js';
import { TtlCache } from '../lib/cache.js';
import { fetchJson } from '../lib/http.js';
import { syncState } from '../lib/settings.js';

const BASE = config.coingecko.pro ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3';

export class UpstreamError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function coingecko(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const headers = {};
  if (config.coingecko.apiKey) {
    headers[config.coingecko.pro ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key'] = config.coingecko.apiKey;
  }
  const response = await fetchJson(url, { headers });
  if (!response.ok) {
    await response.body?.cancel();
    throw new UpstreamError(response.status, `CoinGecko ${path} answered ${response.status}`);
  }
  return response.json();
}

/** Evenly sample `points` down to `target` items, always keeping the last one. */
export function downsample(points, target) {
  if (!Array.isArray(points) || points.length <= target) return points ?? [];
  const step = (points.length - 1) / (target - 1);
  return Array.from({ length: target }, (_, i) => points[Math.round(i * step)]);
}

const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

/** Top 100 coins by market cap with 1h/24h/7d change and a 7-day sparkline, in one request. */
export async function syncMarkets() {
  try {
    const coins = await coingecko('/coins/markets', {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: true,
      price_change_percentage: '1h,24h,7d',
    });
    if (!Array.isArray(coins) || coins.length === 0) throw new Error('Empty market payload');

    const rows = coins.map((c) => ({
      id: c.id,
      symbol: String(c.symbol || '').toUpperCase().slice(0, 30),
      name: String(c.name || c.id).slice(0, 120),
      image: typeof c.image === 'string' ? c.image.slice(0, 500) : null,
      rank: c.market_cap_rank ?? null,
      listed: true,
      price: num(c.current_price),
      marketCap: num(c.market_cap),
      volume24h: num(c.total_volume),
      high24h: num(c.high_24h),
      low24h: num(c.low_24h),
      change1h: num(c.price_change_percentage_1h_in_currency),
      change24h: num(c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h),
      change7d: num(c.price_change_percentage_7d_in_currency),
      circulatingSupply: num(c.circulating_supply),
      totalSupply: num(c.total_supply),
      maxSupply: num(c.max_supply),
      ath: num(c.ath),
      athDate: c.ath_date ? new Date(c.ath_date) : null,
      sparkline: downsample((c.sparkline_in_7d?.price ?? []).filter((p) => Number.isFinite(p)), 56),
      sourceUpdatedAt: c.last_updated ? new Date(c.last_updated) : new Date(),
    }));

    const updatable = [...Object.keys(rows[0]).filter((key) => key !== 'id'), 'updatedAt'];
    await Crypto.bulkCreate(rows, { updateOnDuplicate: updatable });
    await Crypto.update({ listed: false }, { where: { id: { [Op.notIn]: rows.map((r) => r.id) } } });

    syncState.markets = { lastSuccess: new Date(), lastError: null, count: rows.length };
    return rows.length;
  } catch (err) {
    syncState.markets = { ...syncState.markets, lastError: err.message };
    throw err;
  }
}

/** Exchange rates (fiat, crypto, commodities) expressed per 1 BTC. */
export async function syncRates() {
  try {
    const { rates } = await coingecko('/exchange_rates');
    const rows = Object.entries(rates ?? {})
      .filter(([, r]) => Number.isFinite(r?.value) && r.value > 0)
      .map(([code, r]) => ({
        code: code.toLowerCase().slice(0, 12),
        name: String(r.name).slice(0, 80),
        unit: r.unit ? String(r.unit).slice(0, 12) : null,
        type: String(r.type || 'fiat').slice(0, 16),
        valuePerBtc: r.value,
      }));
    if (!rows.some((r) => r.code === 'usd')) throw new Error('USD rate missing');
    await Rate.bulkCreate(rows, { updateOnDuplicate: ['name', 'unit', 'type', 'valuePerBtc', 'updatedAt'] });
    syncState.rates = { lastSuccess: new Date(), lastError: null, count: rows.length };
    return rows.length;
  } catch (err) {
    syncState.rates = { ...syncState.rates, lastError: err.message };
    throw err;
  }
}

export const HISTORY_RANGES = Object.freeze({
  '1d': { days: 1, ttl: 5 * 60_000 },
  '7d': { days: 7, ttl: 30 * 60_000 },
  '30d': { days: 30, ttl: 2 * 3_600_000 },
  '1y': { days: 365, ttl: 12 * 3_600_000 },
});

const historyCache = new TtlCache({ maxEntries: 400 });

/** Price history in USD, cached per coin and range, stale-on-error. */
export function getHistory(id, range) {
  const { days, ttl } = HISTORY_RANGES[range];
  return historyCache.getOrLoad(`${id}:${range}`, ttl, async () => {
    const data = await coingecko(`/coins/${encodeURIComponent(id)}/market_chart`, { vs_currency: 'usd', days });
    const prices = (data?.prices ?? []).filter(
      (p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]),
    );
    return { range, prices: downsample(prices, 160) };
  });
}
