import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { config } from '../config.js';

const blocked = new BlockList();
// IPv4 ranges that must never be reachable from an outbound fetch (SSRF guard).
for (const [net, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blocked.addSubnet(net, prefix, 'ipv4');
}
for (const [net, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
]) {
  blocked.addSubnet(net, prefix, 'ipv6');
}

export function isPrivateAddress(address) {
  const family = isIP(address);
  if (family === 4) return blocked.check(address, 'ipv4');
  if (family === 6) {
    const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (mapped) return blocked.check(mapped[1], 'ipv4');
    return blocked.check(address, 'ipv6');
  }
  return true;
}

export class UnsafeUrlError extends Error {}

/** Throws unless `raw` is an http(s) URL on a standard port that resolves to public addresses only. */
export async function assertPublicHttpUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError('invalid_url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UnsafeUrlError('bad_protocol');
  if (url.username || url.password) throw new UnsafeUrlError('credentials_in_url');
  const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80;
  if (port !== 80 && port !== 443) throw new UnsafeUrlError('bad_port');

  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new UnsafeUrlError('private_address');
  }
  return url;
}

/**
 * fetch() for untrusted URLs: validates every redirect hop, enforces a timeout
 * and caps the body size. Resolves with `{ response, body: Buffer }`.
 */
export async function safeFetch(raw, { timeout = 15_000, maxBytes = 5 * 1024 * 1024, headers = {}, maxRedirects = 3 } = {}) {
  let current = raw;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const url = await assertPublicHttpUrl(current);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeout),
      headers: { 'user-agent': config.userAgent, ...headers },
    });

    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      current = new URL(response.headers.get('location'), url).toString();
      await response.body?.cancel();
      continue;
    }

    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > maxBytes) {
      await response.body?.cancel();
      throw new Error('response_too_large');
    }

    const chunks = [];
    let size = 0;
    if (response.body) {
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > maxBytes) throw new Error('response_too_large');
        chunks.push(chunk);
      }
    }
    return { response, body: Buffer.concat(chunks) };
  }
  throw new Error('too_many_redirects');
}

/** Plain fetch with a timeout and our User-Agent, for trusted APIs (CoinGecko, Discord). */
export function fetchJson(url, { timeout = 20_000, headers = {}, ...init } = {}) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeout),
    headers: { accept: 'application/json', 'user-agent': config.userAgent, ...headers },
  });
}
