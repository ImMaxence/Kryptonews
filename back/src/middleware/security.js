import { BlockList, isIP } from 'node:net';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { config } from '../config.js';
import { log } from '../lib/log.js';

/** Cloudflare edge ranges (https://www.cloudflare.com/ips/). */
const CLOUDFLARE = new BlockList();
for (const range of [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18',
  '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
]) CLOUDFLARE.addSubnet(...range.split('/').map((v, i) => (i ? Number(v) : v)), 'ipv4');
for (const range of ['2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32']) {
  const [address, prefix] = range.split('/');
  CLOUDFLARE.addSubnet(address, Number(prefix), 'ipv6');
}

export function isCloudflareIp(ip) {
  const address = String(ip || '').replace(/^::ffff:/, '');
  const family = isIP(address);
  return family !== 0 && CLOUDFLARE.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

let warnedSpoof = false;

/**
 * Real client IP. CF-Connecting-IP is only believed when the connection really comes from
 * a Cloudflare edge (req.ip is the peer seen by the reverse proxy): someone reaching the
 * origin directly cannot forge it to get a fresh rate-limit bucket on every request.
 */
export function clientIp(req, trustCloudflare = config.trustCloudflare) {
  const cf = trustCloudflare ? req.get('cf-connecting-ip') : null;
  if (cf && isIP(cf)) {
    if (isCloudflareIp(req.ip)) return cf;
    if (!warnedSpoof) {
      warnedSpoof = true;
      log.warn('Ignoring CF-Connecting-IP from a non-Cloudflare peer (origin reached directly?)');
    }
  }
  return req.ip || 'unknown';
}

const limiter = (windowMs, limit, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    ...extra,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
    handler: (_req, res) => res.status(429).json({ error: 'rate_limited' }),
  });

/**
 * General limit for browser calls, which always come through the web container's proxy and
 * carry `x-kn-proxy`. Server-side rendering calls (unmarked) come from that same container:
 * counting them would put every visitor and crawler in one shared bucket, and pages would
 * break under load. The API is only reachable from the internal Docker network, and the
 * stricter limiters (login, access requests, guest, reset) still apply to everyone.
 */
export const apiLimiter = limiter(60_000, 300, { skip: (req) => req.get('x-kn-proxy') !== '1' });
export const credentialsLimiter = limiter(15 * 60_000, 20);
export const sensitiveLimiter = limiter(15 * 60_000, 10);
export const guestLimiter = limiter(15 * 60_000, 30);
// Accounts created per IP: 3 per hour and 10 per day, on top of the global caps.
// Only successful sign-ups count (typos are covered by credentialsLimiter).
export const signupHourlyLimiter = limiter(60 * 60_000, 3, { skipFailedRequests: true });
export const signupDailyLimiter = limiter(24 * 60 * 60_000, 10, { skipFailedRequests: true });
export const challengeLimiter = limiter(15 * 60_000, 30);

const devOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

/**
 * CSRF defence in depth (cookies are already SameSite=Lax): state-changing
 * requests coming from a browser must originate from our own site.
 */
export function originGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  if (origin === config.publicOrigin || (!config.isProd && devOrigin.test(origin))) return next();
  return res.status(403).json({ error: 'forbidden_origin' });
}
