import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TtlCache } from '../src/lib/cache.js';
import { assertPublicHttpUrl, isPrivateAddress } from '../src/lib/http.js';
import { downsample } from '../src/services/coingecko.js';
import { isAllowedEndpoint } from '../src/services/push.js';
import { createHash } from 'node:crypto';
import { createChallenge, hasLeadingZeroBits, verifySolution } from '../src/lib/pow.js';
import { accessRequestSchema } from '../src/lib/schemas.js';
import { credentialsMessage, temporaryPassword } from '../src/routes/admin.js';
import { clientIp, isCloudflareIp } from '../src/middleware/security.js';
import { extractImage, plainText, summarize } from '../src/services/news.js';

describe('SSRF guard', () => {
  it('flags private, loopback and link-local addresses', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.20.0.5', '192.168.1.10', '169.254.169.254', '::1', 'fd00::1', '::ffff:10.0.0.1']) {
      assert.equal(isPrivateAddress(ip), true, ip);
    }
  });

  it('accepts public addresses', () => {
    for (const ip of ['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111']) {
      assert.equal(isPrivateAddress(ip), false, ip);
    }
  });

  it('rejects non-http protocols, odd ports and literal private IPs', async () => {
    await assert.rejects(assertPublicHttpUrl('file:///etc/passwd'));
    await assert.rejects(assertPublicHttpUrl('http://8.8.8.8:3306/'));
    await assert.rejects(assertPublicHttpUrl('http://127.0.0.1/'));
    await assert.rejects(assertPublicHttpUrl('http://[::1]/'));
    await assert.rejects(assertPublicHttpUrl('http://user:pass@8.8.8.8/'));
  });
});

describe('RSS helpers', () => {
  it('decodes entities and strips markup', () => {
    assert.equal(plainText('<p>Bitcoin&#8217;s <b>rally</b> &amp; more</p>'), 'Bitcoin’s rally & more');
  });

  it('summarizes long HTML and drops WordPress boilerplate', () => {
    const html = `<p>${'word '.repeat(120)}</p><p>The post Something appeared first on Some Site.</p>`;
    const summary = summarize(html, 120);
    assert.ok(summary.length <= 121);
    assert.ok(summary.endsWith('…'));
    assert.equal(summarize('<p>Short. The post X appeared first on Y.</p>'), 'Short.');
  });

  it('finds an image in enclosures, media tags or inline HTML', () => {
    assert.equal(
      extractImage({ link: 'https://a.example/post', enclosure: { url: 'https://cdn.example/a.jpg', type: 'image/jpeg' } }),
      'https://cdn.example/a.jpg',
    );
    assert.equal(
      extractImage({ link: 'https://a.example/post', mediaContent: [{ $: { url: 'https://cdn.example/b.png', medium: 'image' } }] }),
      'https://cdn.example/b.png',
    );
    assert.equal(
      extractImage({ link: 'https://a.example/post', contentEncoded: '<p><img src="/img/c.webp"></p>' }),
      'https://a.example/img/c.webp',
    );
    assert.equal(extractImage({ link: 'https://a.example/post', content: '<img src="javascript:alert(1)">' }), null);
  });
});

describe('downsample', () => {
  it('keeps first and last points and the requested size', () => {
    const points = Array.from({ length: 168 }, (_, i) => i);
    const sampled = downsample(points, 56);
    assert.equal(sampled.length, 56);
    assert.equal(sampled[0], 0);
    assert.equal(sampled.at(-1), 167);
  });

  it('returns short inputs untouched', () => {
    assert.deepEqual(downsample([1, 2, 3], 10), [1, 2, 3]);
    assert.deepEqual(downsample(undefined, 10), []);
  });
});

describe('TtlCache', () => {
  it('coalesces concurrent loads and serves stale values when the loader fails', async () => {
    const cache = new TtlCache();
    let calls = 0;
    const loader = async () => {
      calls += 1;
      return calls;
    };
    const [a, b] = await Promise.all([cache.getOrLoad('k', 1, loader), cache.getOrLoad('k', 1, loader)]);
    assert.equal(a, 1);
    assert.equal(b, 1);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const stale = await cache.getOrLoad('k', 1000, async () => {
      throw new Error('upstream down');
    });
    assert.equal(stale, 1);
  });

  it('evicts least recently used entries by byte size', () => {
    const cache = new TtlCache({ maxBytes: 10 });
    cache.set('a', 'a', 1000, 6);
    cache.set('b', 'b', 1000, 6);
    assert.equal(cache.peek('a'), undefined);
    assert.equal(cache.peek('b').value, 'b');
  });
});

describe('push endpoints', () => {
  it('accepts the browser vendors push services', () => {
    for (const url of ['https://fcm.googleapis.com/fcm/send/abc', 'https://updates.push.services.mozilla.com/wpush/v2/abc', 'https://web.push.apple.com/QAbc', 'https://wns2-par02p.notify.windows.com/w/?token=abc']) {
      assert.equal(isAllowedEndpoint(url), true, url);
    }
  });

  it('refuses anything else (SSRF guard)', () => {
    for (const url of ['http://fcm.googleapis.com/fcm/send/abc', 'https://fcm.googleapis.com:8443/x', 'https://evil.example/fcm.googleapis.com', 'https://fcm.googleapis.com.evil.example/x', 'http://db:3306/', 'https://169.254.169.254/latest', 'not a url']) {
      assert.equal(isAllowedEndpoint(url), false, url);
    }
  });
});

describe('sign-up proof of work', () => {
  const solve = (challenge) => {
    for (let n = 0; ; n += 1) {
      const hash = createHash('sha256').update(`${challenge.salt}${n}`).digest();
      if (hasLeadingZeroBits(hash, challenge.bits)) return { ...challenge, nonce: String(n) };
    }
  };

  it('counts leading zero bits', () => {
    assert.equal(hasLeadingZeroBits(Buffer.from([0, 0x0f]), 12), true);
    assert.equal(hasLeadingZeroBits(Buffer.from([0, 0x1f]), 12), false);
  });

  it('accepts a valid solution once, then refuses the replay', () => {
    const solution = solve(createChallenge());
    assert.equal(verifySolution(solution), true);
    assert.equal(verifySolution(solution), false);
  });

  it('refuses tampered or weakened challenges', () => {
    const challenge = createChallenge();
    const solution = solve(challenge);
    assert.equal(verifySolution({ ...solution, nonce: 'x' }), false);
    assert.equal(verifySolution({ ...solution, bits: 8 }), false);
    assert.equal(verifySolution({ ...solution, expires: solution.expires + 1 }), false);
    assert.equal(verifySolution({ ...solve(createChallenge()), signature: '0'.repeat(64) }), false);
    assert.equal(verifySolution({ ...solution, expires: Date.now() - 1 }), false);
  });
});

describe('access requests', () => {
  it('validates names and normalises the email', () => {
    const base = { firstName: ' Marie ', lastName: "D'Arc-Curie", email: ' Marie@Example.COM ', acceptTerms: true, pow: { salt: 'a'.repeat(32), bits: 16, expires: 1, signature: 'b'.repeat(64), nonce: '1' } };
    const parsed = accessRequestSchema.parse(base);
    assert.equal(parsed.firstName, 'Marie');
    assert.equal(parsed.email, 'marie@example.com');
    assert.equal(parsed.locale, 'en');
    for (const firstName of ['', '<script>', '1337', 'x'.repeat(61)]) {
      assert.equal(accessRequestSchema.safeParse({ ...base, firstName }).success, false, firstName);
    }
    assert.equal(accessRequestSchema.safeParse({ ...base, acceptTerms: false }).success, false);
    assert.equal(accessRequestSchema.safeParse({ ...base, pow: undefined }).success, false);
  });

  it('generates readable, high-entropy temporary passwords', () => {
    const seen = new Set();
    for (let i = 0; i < 200; i += 1) {
      const password = temporaryPassword();
      assert.match(password, /^[a-hj-km-np-z2-9]{4}(-[a-hj-km-np-z2-9]{4}){3}$/);
      seen.add(password);
    }
    assert.equal(seen.size, 200);
  });
});

describe('credentials email', () => {
  it('is written in the reader language and carries the login details', () => {
    const args = { firstName: 'Marie', email: 'marie@example.com', password: 'abcd-efgh-jkmn-pqrs', loginUrl: 'https://kryptonews.example/fr/connexion' };
    const fr = credentialsMessage({ ...args, locale: 'fr' });
    assert.match(fr.subject, /Kryptonews/);
    assert.match(fr.body, /^Bonjour Marie,/);
    for (const value of Object.values(args)) assert.ok(fr.body.includes(value));
    assert.match(credentialsMessage({ ...args, locale: 'en' }).body, /^Hello Marie,/);
  });
});

describe('client IP behind Cloudflare', () => {
  const request = (ip, cf) => ({ ip, get: (name) => (name === 'cf-connecting-ip' ? cf : undefined) });

  it('recognises Cloudflare edge addresses only', () => {
    assert.equal(isCloudflareIp('172.68.10.1'), true);
    assert.equal(isCloudflareIp('::ffff:104.16.0.1'), true);
    assert.equal(isCloudflareIp('2606:4700::1'), true);
    assert.equal(isCloudflareIp('203.0.113.7'), false);
    assert.equal(isCloudflareIp('not-an-ip'), false);
  });

  it('believes CF-Connecting-IP only from a Cloudflare peer', () => {
    assert.equal(clientIp(request('172.68.10.1', '198.51.100.4'), true), '198.51.100.4');
    assert.equal(clientIp(request('203.0.113.7', '198.51.100.4'), true), '203.0.113.7');
    assert.equal(clientIp(request('172.68.10.1', 'garbage'), true), '172.68.10.1');
  });
});
