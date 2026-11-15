import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import { config, parseEmailList } from '../src/config.js';
import { forbidGuest, loadUser, readSession, requireAdmin, setGuestCookie } from '../src/middleware/auth.js';

/** Minimal response double that captures the cookie set by setGuestCookie. */
function fakeResponse() {
  return {
    cookies: {},
    cookie(name, value) {
      this.cookies[name] = value;
    },
    clearCookie() {},
  };
}

async function guestRequest(method = 'GET') {
  const res = fakeResponse();
  setGuestCookie(res, 'fr');
  const req = { method, cookies: { kn_session: res.cookies.kn_session } };
  readSession(req, res, () => {});
  return { req, res };
}

describe('ADMIN_EMAILS parsing', () => {
  it('trims, lowercases, dedupes and drops invalid entries', () => {
    assert.deepEqual(parseEmailList(' Ada@Example.com,bob@example.com ,, ada@example.com, not-an-email '), ['ada@example.com', 'bob@example.com']);
    assert.deepEqual(parseEmailList(undefined), []);
  });
});

describe('guest session', () => {
  it('decodes into a virtual, database-less guest user', async () => {
    const { req } = await guestRequest();
    const user = await loadUser(req);
    assert.equal(user.isGuest, true);
    assert.equal(user.role, 'guest');
    assert.equal(user.id, 0);
    assert.equal(user.locale, 'fr');
  });

  it('is refused by forbidGuest on every route that changes data', async () => {
    const { req, res } = await guestRequest('POST');
    await assert.rejects(forbidGuest(req, res, () => {}), (err) => err.status === 403 && err.code === 'guest_readonly');
  });

  it('may read the editor desk but never write to it', async () => {
    const get = await guestRequest('GET');
    let passed = false;
    await requireAdmin(get.req, get.res, () => {
      passed = true;
    });
    assert.equal(passed, true);

    const post = await guestRequest('PATCH');
    await assert.rejects(requireAdmin(post.req, post.res, () => {}), (err) => err.code === 'guest_readonly');
  });

  it('never accepts a password-reset token (or an untyped token) as a session', async () => {
    for (const payload of [{ typ: 'reset', fp: 'x' }, { v: 0 }]) {
      const token = jwt.sign(payload, config.jwtSecret, { algorithm: 'HS256', subject: '1', expiresIn: '1h' });
      const req = { method: 'GET', cookies: { kn_session: token } };
      readSession(req, {}, () => {});
      assert.equal(req.session, null, JSON.stringify(payload));
    }
  });

  it('ignores tampered tokens', async () => {
    const req = { method: 'GET', cookies: { kn_session: 'eyJhbGciOiJub25lIn0.eyJndWVzdCI6dHJ1ZX0.' } };
    readSession(req, {}, () => {});
    assert.equal(req.session, null);
    assert.equal(await loadUser(req), null);
  });
});
