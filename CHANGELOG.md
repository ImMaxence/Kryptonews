# Changelog

All notable changes to Kryptonews are recorded here.

## Versioning: `MAJOR.MEDIUM.MINOR`

| Level | When it changes | Example |
|---|---|---|
| **MAJOR** | A new edition of the paper: redesign, stack change, breaking change to the API, the data model or the URLs. | `1.x.x → 2.0.0` |
| **MEDIUM** | A new feature, page or data source, backwards compatible. | `2.0.0 → 2.1.0` |
| **MINOR** | A fix, wording, style tweak, dependency update or content change. | `2.1.0 → 2.1.1` |

Each release lists its changes under **Added**, **Changed**, **Fixed**, **Removed** and **Security**.

---

## [2.1.0] - 2026-11-15 - “Late edition”

New features on top of 2.0.0, backwards compatible: existing databases are migrated automatically at start-up.

### Added
- **Accounts on request**: readers no longer create accounts themselves. “Request access” asks for a first name, last name and email; editors approve or decline each request on the desk. Approving creates the account with a strong temporary password and prepares the email to send (in the reader's language, with a “Write the email” button); the reader chooses their own password at first login.
- **Anti-abuse protection for access requests**: invisible proof of work solved in the browser (no third-party CAPTCHA, ~0.2 s on desktop), honeypot field, per-IP limits (3 per hour, 10 per day), global caps (`SIGNUP_MAX_PER_HOUR`, `SIGNUP_MAX_PER_DAY`), a bounded queue (`MAX_PENDING_REQUESTS`, default 100), automatic deletion of unanswered requests (`PENDING_REQUEST_DAYS`, default 30), a ceiling on accounts (`MAX_ACCOUNTS`), duplicate requests silently ignored, and an open/closed switch plus “Decline all” on the desk.
- **Installable app (PWA)**: web app manifest with shortcuts, screenshots and a maskable icon, a service worker (cached build assets, offline page), and an “Install Kryptonews” button.
- **Opt-in push notifications** (Web Push / VAPID, no third-party SDK): *market alerts* when a watched coin (BTC/ETH by default) moves ±5% in 24h, and *the morning edition* every day around 8:00 Paris time. Permission is only requested from the bell, never on load. VAPID keys are generated automatically if not provided.
- **Guest mode**: “Explore as a guest” opens a 24-hour, read-only demo session with fictional data, including the editor's desk (fictional readers and figures, every control disabled). What a guest clips, watches or customises is saved in the browser only (localStorage) and **imported automatically** the first time they log in to a real account.
- **Editor sign-in with Google** (OAuth 2.0 + PKCE), restricted to the comma-separated `ADMIN_EMAILS` list; any other Google account is refused and nothing is created. A dedicated “Editor's entrance” replaces the reader login for the desk.
- **Editor-assisted password reset**: “Forgot your password?” explains the procedure; editors generate a single-use, one-hour reset link from the desk. No email server required.
- **“Feedback or a bug?”** dialog (footer, error and 404 pages): pre-filled GitHub issue (new issue forms in `.github/ISSUE_TEMPLATE`) or pre-filled email to `CONTACT_EMAIL`.
- **MIT License** for the source code (`LICENSE`).
- `/.well-known/security.txt` (RFC 9116) and a `SECURITY.md` disclosure policy.
- Configurable headline retention (`ARTICLE_RETENTION_DAYS`, default 45 days), shown on the editor's desk.
- Masthead “Vol. II · No. …” now explains itself (tooltip and link to the About page).

### Changed
- **Simpler accounts**: readers log in with their **email + password**; the display name is generated from their name and editable later.
- Article images are resized and re-encoded to **WebP** by the media proxy (sharp): typically −80 to −90% (663 KB → 91 KB on a sample).
- Lighter first load: Newsreader without the optical-size axis, two monospace weights, server-only translations no longer sent to the browser. Lighthouse mobile performance went from 54–79 to 81–99 (median of three runs), desktop 99–100.
- Runtime Docker images no longer ship npm, npx, corepack or yarn (unused at runtime).
- Guest session lasts 24 hours (was 2 hours).

### Removed
- **Self-service sign-up** (`POST /api/auth/register`), replaced by access requests.
- **Discord sign-in** (code, configuration and legal mentions).

### Fixed
- Modal dialogs (feedback, account deletion, reset link) were stuck in the top-left corner: they are centred again, and open on their main button.
- Horizontal scroll on the editor's desk at tablet widths (visually hidden labels escaping their scroll container).
- Layout shift on coin pages (monospace font now preloaded), tap targets under 24 px, text under 11 px on mobile.
- Night-edition guest banner contrast.
- Lighthouse SEO warning on the login page (no longer blocked in `robots.txt`).
- Invalid `Permissions-Policy` directive (`browsing-topics`).

### Security
- **Nonce-based Content Security Policy** generated per request: `script-src` no longer allows `'unsafe-inline'` (OWASP ZAP warning resolved). Static, script-free CSP for API and text routes; `Cross-Origin-Embedder-Policy: require-corp` added.
- Tokens are now typed (`session`, `guest`, `reset`): a password-reset token can never be used as a session, and vice versa.
- **Spoof-proof client IP**: `CF-Connecting-IP` is only trusted when the connection really comes from a Cloudflare edge range, so reaching the origin directly no longer grants a fresh rate-limit bucket per request.
- **Account pre-hijacking defence**: when an editor first signs in with Google, any password set by whoever registered that address beforehand is wiped and its sessions revoked.
- Push endpoints are restricted to the browser vendors' push services (SSRF guard); internal settings (VAPID keys) can never leak through the settings API.
- Clipping images are only served to their owner (no enumeration of other readers' clippings).
- Guest-mode local data is sanitised on render (only http(s) links).
- Upgraded `sharp` to 0.35.5 (libvips/libheif advisories). `npm audit`: 0 vulnerabilities; Trivy: 0 HIGH/CRITICAL in both images.

---

## [2.0.0] - 2026-11-15 - “Ledger Press”

Complete redesign and rewrite. The V1 market pipeline depended on the CoinCap v2 API, which has been shut down: this edition moves to CoinGecko and rebuilds every layer.

### Added
- **“Ledger Press” design system**: broadsheet newspaper identity with a blackletter masthead, newsprint grain, halftone photos, ruled columns, rubber stamps, drop caps and a live stock-ticker band.
- **Day and night editions** (light/dark themes) that follow the system preference, with a toggle stored on the device.
- **Bilingual site (FR / EN)** with localized URLs (`/fr/marches`, `/en/markets`…), automatic language detection and a language switch on every page.
- **Front page**: lead story, secondary stories, market report rail (BTC/ETH, top-100 cap, BTC dominance), biggest movers, editor's note, readers' FAQ.
- **Market ledger**: top 100 coins, sortable columns, instant filter, 1h/24h/7d change, market cap, volume, 7-day sparklines, market-wide summary.
- **13 display currencies** (USD, EUR, GBP, CHF, CAD, AUD, JPY, CNY, INR, BRL, KRW, BTC, ETH), EUR by default in French.
- **Coin pages** for every listed coin: live price, key figures (ATH, supplies, 24h range), keyboard-accessible SVG chart (24h / 7d / 30d / 1y), two-way converter, related headlines.
- **The wire**: search, language and newsroom filters (works without JavaScript), “load more” pagination.
- **Eight newsrooms** seeded by default: Cointelegraph, CoinDesk, Decrypt, The Block, Bitcoin Magazine, Journal du Coin, Cryptoast, Coin Academy.
- **Clippings and watchlist**: save stories and coins; clippings keep their title and image after the article expires.
- **Account page (“press card”)**: profile, pixel-art portrait, preferred language, password change, JSON data export, account deletion.
- **Editor's desk** (admin): live job status with “run now”, newsroom management (add, pause, fetch, delete), free-edition limits, reader roles.
- **SEO**: server-side rendering, canonical and `hreflang` tags, dynamic `sitemap.xml` and `robots.txt`, JSON-LD structured data, generated Open Graph images (one live card per coin), web app manifest and icons.
- **AI search optimisation**: `/llms.txt` site map and `/llms-full.txt` live Markdown snapshot; AI crawlers explicitly allowed.
- **Accessibility**: RGAA 4.1.2 / WCAG 2.2 AA target, skip link, landmarks, focus management, pausable ticker, reduced-motion support, language marking; 0 axe-core violations at release.
- **Legal pages** in both languages: legal notice, privacy policy, terms of use, accessibility statement.
- **Coolify-ready Docker Compose** deployment with health checks, generated secrets and log rotation; local override for Docker Desktop.
- API unit tests (SSRF guard, RSS parsing, sampling, cache) and an i18n key-parity check.

### Changed
- Frontend rewritten from Create React App to **Next.js 16** (App Router, React 19, TypeScript).
- Backend rewritten for **Node.js 24 LTS** and **Express 5** (ES modules, Zod validation, central error handling).
- Database upgraded to **MariaDB 11.8 LTS** with a new schema (coins keyed by CoinGecko id, per-feed articles, favorites with snapshots, settings).
- Market data now comes from **CoinGecko**: one request returns prices, ranks, changes and sparklines, replacing the per-coin history crons.
- RSS ingestion rewritten: deduplication by GUID, image extraction from enclosures/media tags/HTML, clean excerpts, 45-day retention.
- The browser only talks to the site's own domain: the API is reached through an internal proxy, and coin logos and article images go through a cached media proxy.
- Data jobs run immediately at start-up, then on a schedule (prices every 2 min, news every 10 min, exchange rates every 30 min).
- Guest limits raised (20 coins, 12 headlines) and configurable from the editor's desk.

### Fixed
- Market data, charts and rates were broken since the CoinCap v2 shutdown.
- Discord sign-in was hard-wired to the old `kryptonews.fun` domain; it now uses `PUBLIC_URL`.
- Several crashes on missing data (history, empty lists, unknown ids).

### Removed
- Create React App, Bootstrap, Chart.js and the V1 colour-theme picker.
- phpMyAdmin, Portainer, the Traefik/Ansible production files and the `kryptonews.fun` configuration (replaced by Coolify).
- Public database port and public API port.

### Security
- **Fixed account takeover**: V1 logged anyone in as any user with `?z=<id>`. Sessions are now signed, HTTP-only, SameSite cookies.
- Hard-coded JWT secret and admin password removed (generated secrets, admin created from environment variables).
- Every write route is authenticated and authorised (admin role checked server-side); the last editor cannot be demoted or deleted.
- Origin checks on state-changing requests, rate limiting on login, sign-up and sensitive actions, timing-safe login.
- SSRF protection for RSS feeds and the image proxy (private ranges, ports and redirects validated); SVG and non-image responses refused.
- Strict Content Security Policy and security headers; no third-party requests from the browser.

---

## [1.0.0] - 2024-01-15

First edition, built as a group project of the Epitech MSc programme by Maxence Bonnici, Maxence Laporte, Matéo Salvy, Meriem Boussaid and Federico Suarez.

### Added
- React (Create React App) front end with home, crypto table, news, favorites, profile and registration pages.
- Express + Sequelize API with MariaDB, CoinCap market data and Cointelegraph RSS feed.
- Username/password and Discord sign-in, favorites, admin panel for RSS feeds and guest limits.
- Six colour themes, Docker Compose, Traefik/Ansible deployment on `kryptonews.fun`.
