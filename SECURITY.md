# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

- Preferred: [open a private security advisory](https://github.com/ImMaxence/Kryptonews/security/advisories/new) on GitHub.
- Or write to the contact address published in [`/.well-known/security.txt`](https://kryptonews.mbonnici.fr/.well-known/security.txt).

You should get an answer within a few days. Please give enough detail to reproduce the issue, and allow time for a fix before any public disclosure. Kryptonews is a personal, non-commercial project: there is no bug bounty, but every valid report is credited in the changelog if you wish.

Only the latest release is supported.

## Security design

| Area | Measures |
|---|---|
| Account creation | No self-service sign-up: access requests (name + email) are reviewed by an editor. Requests pass a honeypot and a self-hosted proof of work, are limited per IP (3/h, 10/day) and globally (per hour, per day, 100 pending at most, accounts ceiling), are deleted after 30 days unanswered, and can be switched off or bulk-declined from the desk. Duplicates are answered like new requests (no enumeration). |
| Authentication | Readers: email + password, hashed with bcrypt (cost 12), timing-safe login, rate limiting. Accounts start with a random ~80-bit temporary password that the reader is asked to replace at first login. Editors: Google OAuth 2.0 with PKCE and `state`, restricted to `ADMIN_EMAILS`. |
| Sessions | HS256 JWT in an `HttpOnly`, `SameSite=Lax`, `Secure` (over https) cookie; typed tokens (`session` / `guest` / `reset`); a per-user token version revokes every session on password change or reset. |
| Authorisation | Every write route requires a signed-in reader; editor routes check the role server-side; the guest (demo) session is read-only everywhere and only ever sees fictional readers; the last editor cannot be demoted or deleted. |
| Account recovery | Single-use, one-hour reset links issued by an editor; the link embeds a fingerprint of the current password, so it dies once used. Editors cannot be reset (Google only). |
| CSRF | `SameSite=Lax` cookies plus an `Origin` check on every state-changing request. |
| XSS | React escaping, no HTML from feeds is rendered, links restricted to http(s), per-request **nonce CSP** with `strict-dynamic` (no `'unsafe-inline'` scripts). |
| SSRF | RSS feeds, images and push endpoints are fetched server-side through guards: http(s) only, ports 80/443, no private/loopback/link-local addresses (every redirect re-checked), size and time limits; push endpoints limited to the browser vendors' services. |
| Images | Only URLs already stored in the database can be proxied; SVG refused; pixel limit against decompression bombs; served with a sandboxing CSP. |
| Headers | HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP / COEP. |
| Infrastructure | API and database are never exposed (internal Docker network, proxied through the web container); containers run as a non-root user; runtime images ship without npm/yarn; generated secrets (Coolify); log rotation; no IP address is logged by the application. |
| Privacy | No analytics, no ads, no third-party request from the browser (fonts and images are first-party). |

## Audit: version 2.1.0 (15 November 2026)

Self-assessment, not a third-party penetration test.

| Check | Tool | Result |
|---|---|---|
| Dependencies | `npm audit` (API production deps, web all deps) | 0 vulnerabilities |
| Container images | Trivy (HIGH, CRITICAL) on both images | 0 findings (after removing the npm CLI bundled in the Node base image, which carried 6 HIGH CVEs in `undici` and `brace-expansion`) |
| Dynamic scan | OWASP ZAP baseline (passive) | 0 FAIL; the `script-src 'unsafe-inline'` and missing COEP warnings were fixed; remaining warnings are informational (timestamps in market data, non-cacheable dynamic pages, redirects carrying the public page shell) |
| Code review | OWASP Top 10 walk-through | Findings fixed in 2.1.0: reset tokens accepted as sessions, VAPID keys reachable through the settings API, clipping images readable by id, account pre-hijacking on editor emails, unsanitised guest-mode links |
| Automated tests | `node --test` (API) and Playwright end-to-end suites | SSRF guards, token separation, guest read-only guards (11 write routes), reset single-use, push endpoint allowlist |

### Known limitations and recommendations

- **Restrict the origin to Cloudflare anyway.** `CF-Connecting-IP` is only believed from Cloudflare edge addresses, but allowing only Cloudflare IP ranges on ports 80/443 (or using a Cloudflare Tunnel) also hides the home server from direct scans. A Cloudflare rate-limiting rule on `/api/auth/access-request` and Bot Fight Mode add a free outer layer.
- **Temporary passwords travel by email**: the editor sends them in clear; they are random, single-account, and the reader is asked to replace them at first login.
- **No email verification** for access requests: the editor checks the request by hand; editor accounts are protected by Google and by the pre-hijacking defence.
- The proof of work slows bots down but does not stop a determined attacker with CPU to spare: the global caps and the bounded queue are what keep the database small.
- **DNS rebinding**: the SSRF guard resolves then fetches; a very fast rebinding could slip between the two. Impact is limited to reading public-looking image/RSS responses.
- **`style-src 'unsafe-inline'`** remains (inline style attributes); it does not allow script execution.
- The optional password editor (`ADMIN_EMAIL` + `ADMIN_PASSWORD`) is a break-glass account: once Google sign-in works, keep its generated password secret or remove those variables.
- bcrypt only uses the first 72 bytes of a password.
