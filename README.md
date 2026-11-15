<p align="center">
  <img src="doc/screenshots/hero.jpg" alt="Kryptonews front page in the day edition on desktop, and the night edition on a phone" width="100%">
</p>

<h1 align="center">Kryptonews</h1>

<p align="center">
  <strong>The crypto ledger, printed live.</strong><br>
  Live prices for the 100 largest cryptocurrencies and the headlines that move them,<br>
  typeset like a broadsheet, in English and French. Installable, private, accessible.
</p>

<p align="center">
  <a href="https://kryptonews.mbonnici.fr"><strong>Read today's edition →</strong></a>
</p>

<p align="center">
  <img alt="Version 2.1.0" src="https://img.shields.io/badge/edition-2.1.0-b8360f">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-16130f?logo=nextdotjs">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-16130f?logo=react">
  <img alt="Node.js 24 LTS" src="https://img.shields.io/badge/Node.js-24_LTS-16130f?logo=nodedotjs">
  <img alt="MariaDB 11.8 LTS" src="https://img.shields.io/badge/MariaDB-11.8_LTS-16130f?logo=mariadb">
  <img alt="Installable PWA" src="https://img.shields.io/badge/PWA-installable-16130f?logo=pwa">
  <img alt="Lighthouse accessibility, best practices and SEO 100" src="https://img.shields.io/badge/Lighthouse-A11y_·_BP_·_SEO_100-0b6a39?logo=lighthouse">
  <img alt="WCAG 2.2 AA, 0 axe violations" src="https://img.shields.io/badge/WCAG_2.2_AA-0_axe_violations-0b6a39">
  <img alt="English and French" src="https://img.shields.io/badge/i18n-EN_%7C_FR-16130f">
</p>

---

## Why Kryptonews?

Most crypto sites look like casinos: neon gradients, blinking numbers, banners everywhere.
**Kryptonews takes the opposite stance.** It borrows the calm authority of a printed newspaper (blackletter masthead, newsprint paper, halftone photos, ruled columns, a stock-ticker band) and puts real-time data behind it.

- **One page to understand the market.** The top 100 coins, refreshed every two minutes, next to the stories behind the moves.
- **Eight newsrooms, two languages.** Cointelegraph, CoinDesk, Decrypt, The Block, Bitcoin Magazine, Journal du Coin, Cryptoast and Coin Academy, searchable in one wire.
- **Try everything, ask for an account later.** Guest mode opens the full experience with demo data, and keeps what you clip in your browser until your first login.
- **Accounts on request, bots kept out.** Visitors leave their name and email; editors approve each request from the desk in one click and send the prepared email. An invisible proof of work, a honeypot and strict caps mean a bot cannot fill the database.
- **On your home screen.** Install it as an app, and opt in to market alerts or a morning edition.
- **Free, no ads, no tracking.** Fonts, logos and article images are served first-party: your browser never talks to a third party.

## What's in the edition

### The front page
A real front page: lead story with a halftone photo and a blackletter drop cap, secondary stories in ruled columns, a market report rail with the day's biggest movers, an editor's note and a readers' FAQ.

<img src="doc/screenshots/front-page.jpg" alt="Kryptonews front page: masthead, live ticker, lead story and market report" width="100%">

### The night edition
One click switches to an ink-black edition. Both themes follow the system preference, and every text colour was checked against WCAG AA contrast.

<img src="doc/screenshots/night-edition.jpg" alt="The French front page in the dark night edition" width="100%">

### The market ledger
The top 100 cryptocurrencies laid out like the stock pages of a daily: sortable columns, 1h / 24h / 7d change, market cap, volume, 7-day sparklines, instant filtering and **13 display currencies** (USD, EUR, GBP, CHF, JPY, BTC, ETH…).

<img src="doc/screenshots/market-ledger.jpg" alt="The market ledger table with sparklines" width="100%">

### Coin pages
Every coin gets its own indexable page: live price, an engraving-style chart (24h, 7 days, 30 days, 1 year) that can be read with the keyboard, key figures, a two-way converter and the related headlines.

<img src="doc/screenshots/coin-page.jpg" alt="Bitcoin page with an interactive hatched price chart, key figures and converter" width="100%">

### The wire
Every headline from every newsroom, searchable, filterable by language and newsroom, refreshed every ten minutes. The search form even works without JavaScript.

<img src="doc/screenshots/the-wire.jpg" alt="The French news wire with search filters" width="100%">

### Guest mode: the whole paper, no sign-up
“Explore as a guest” opens a 24-hour demo session: a pre-filled scrapbook, a press card and even the editor's desk, all with fictional data. Whatever a guest clips or customises stays **in their browser**, and is **imported automatically** the first time they log in to their account.

<img src="doc/screenshots/guest-mode.jpg" alt="Guest mode: yellow demo banner above a scrapbook of clipped stories" width="100%">

### Accounts on request, bots kept out
Nobody fills your database behind your back. Visitors **request access** with their first name, last name and email; editors approve each request from the desk in one click. Approving creates the account with a strong temporary password and prepares the email in the reader's language: one more click opens it in your mail client. The reader picks their own password at first login.

Behind the form: an invisible proof of work computed by the browser (no third-party CAPTCHA, no cookie), a honeypot, per-IP limits, global hourly and daily caps, a waiting queue capped at 100 requests, automatic deletion after 30 days, and an open/closed switch.

<img src="doc/screenshots/access-request.jpg" alt="Request access coupon: first name, last name and email" width="100%">

<p>
  <img src="doc/screenshots/access-desk.jpg" alt="Editor's desk: access requests queue with approve and decline buttons" width="49%">
  <img src="doc/screenshots/access-approval.jpg" alt="Account created dialog with the prepared email and temporary password" width="49%">
</p>

### Clippings, watchlist and press card
Readers clip stories into a taped-paper scrapbook, star the coins they watch, and manage their account from a press card. Data export (JSON) and account deletion are one click away.

<p>
  <img src="doc/screenshots/clippings.jpg" alt="Clippings: saved stories shown as taped newspaper cut-outs" width="49%">
  <img src="doc/screenshots/press-card.jpg" alt="Account page with the press card, in the night edition" width="49%">
</p>

### An app, with alerts you choose
Kryptonews installs like a native app (home screen, full screen, offline page). From the bell, readers can opt in to **market alerts**, when a watched coin moves ±5% in 24 hours, and to **the morning edition**, a daily summary at 8:00. Nothing is ever requested on page load.

<img src="doc/screenshots/notifications.jpg" alt="Notifications dialog in the night edition: market alerts, morning edition and install the app" width="100%">

### The editor's desk
A back office in the same visual language: answer access requests, run the presses on demand, add or pause newsrooms (RSS), tune the free-edition limits, promote readers and issue password reset links. Editors sign in with **Google only**, restricted to an allow-list of addresses.

<p>
  <img src="doc/screenshots/editors-desk.jpg" alt="Editor's desk: key figures and the access requests queue at the top" width="49%">
  <img src="doc/screenshots/editor-entrance.jpg" alt="Editor's entrance with Google sign-in" width="49%">
</p>

A reader who forgets their password writes to the editors; one click on the desk creates a **single-use reset link, valid for one hour**, to send to the account's address. New readers land on their press card at first login and are asked to replace their temporary password.

<p>
  <img src="doc/screenshots/readers-reset.jpg" alt="Readers table with the password reset link dialog open" width="49%">
  <img src="doc/screenshots/first-login.jpg" alt="First login: the account page asks the reader to choose their own password" width="49%">
</p>

### Letters to the editor
A “Feedback or a bug?” button turns any page into a pre-filled GitHub issue (page, version, browser) or a pre-filled email.

<img src="doc/screenshots/feedback.jpg" alt="Feedback dialog offering a GitHub issue or an email" width="100%">

### Mobile first
<p>
  <img src="doc/screenshots/mobile-front.jpg" alt="Front page on mobile, night edition" width="24%">
  <img src="doc/screenshots/mobile-markets.jpg" alt="Market ledger on mobile" width="24%">
  <img src="doc/screenshots/mobile-coin.jpg" alt="Ethereum page on mobile with chart" width="24%">
  <img src="doc/screenshots/mobile-desk.jpg" alt="Access requests on the editor's desk on mobile, shown as cards with approve and decline buttons" width="24%">
</p>

## Fast, found, accessible

**Lighthouse 13** (local production build, median of three runs; mobile is simulated slow 4G with a 4× slower CPU):

| Page | Performance (mobile) | Performance (desktop) | Accessibility | Best practices | SEO |
|---|:-:|:-:|:-:|:-:|:-:|
| Front page | 81 | 99 | 100 | 100 | 100 |
| The wire | 99 | 99 | 100 | 100 | 100 |
| Market ledger | 89 | 100 | 100 | 100 | 100 |
| Coin page | 86 | 100 | 100 | 100 | 100 |

**Search and AI search**: server-side rendering, localized URLs (`/en/markets` ↔ `/fr/marches`) with `hreflang`, a dynamic sitemap (static pages plus 100 coin pages in two languages), JSON-LD (`Organization`, `WebSite` + `SearchAction`, `FAQPage`, `BreadcrumbList`, `ItemList`, `NewsArticle`, `ExchangeRateSpecification`), generated social cards (a live card per coin), and [`/llms.txt`](https://kryptonews.mbonnici.fr/llms.txt) plus a live Markdown snapshot at [`/llms-full.txt`](https://kryptonews.mbonnici.fr/llms-full.txt) for assistants. AI crawlers are explicitly welcome in `robots.txt`.

**Accessibility**: targets RGAA 4.1.2 / WCAG 2.2 AA, with **0 axe-core violations** on every public, private and guest page, in both themes, on desktop and mobile. Skip link, landmarks, visible focus, full keyboard support (including the chart), colour never used alone, a pausable ticker, *reduce motion* support, 24 px tap targets, no horizontal scroll from 320 px. See the [accessibility statement](https://kryptonews.mbonnici.fr/en/accessibility).

## Secure and private by design

- Email + password for readers (bcrypt, rate limiting); Google OAuth with PKCE for editors, restricted to `ADMIN_EMAILS`.
- HttpOnly, SameSite session cookies; typed tokens; sessions revoked on password change; single-use reset links.
- Per-request **nonce Content Security Policy** (no inline scripts), HSTS, COOP/COEP, strict origin checks.
- SSRF-safe fetching for RSS, images and push endpoints; images resized and sandboxed by a first-party proxy.
- API and database never exposed; non-root containers without npm; secrets generated by Coolify.
- No analytics, no ads, no tracking cookies: no cookie banner needed. GDPR tools built in (export, deletion, inactive account purge).
- Audited for 2.1.0: `npm audit` 0, Trivy 0 HIGH/CRITICAL, OWASP ZAP baseline 0 FAIL. See **[SECURITY.md](SECURITY.md)**.

## Under the hood

```mermaid
flowchart LR
  reader((Reader)) -->|HTTPS| cf[Cloudflare]
  cf --> proxy[Coolify / Traefik]
  proxy --> front["front<br/>Next.js 16 · React 19<br/>SSR · i18n · PWA"]
  front -->|/api proxy| back["back<br/>Node 24 · Express 5"]
  back --> db[(MariaDB 11.8)]
  back -->|every 2 min| cg[CoinGecko API]
  back -->|every 10 min| rss[8 newsroom RSS feeds]
  back -->|opt-in| push[Browser push services]
```

| Layer | Technology |
|---|---|
| Web | Next.js 16 (App Router, standalone output), React 19, TypeScript, next-intl 4, SWR, hand-written CSS design system (“Ledger Press”), custom SVG charts, service worker |
| API | Node.js 24 LTS, Express 5, Sequelize 6, Zod 4, helmet, express-rate-limit, rss-parser, sharp, web-push |
| Data | MariaDB 11.8 LTS, CoinGecko API (no key required), public RSS feeds |
| Ops | Docker Compose, Coolify, Cloudflare, container health checks |

## Quick start (Docker Desktop)

```bash
git clone https://github.com/ImMaxence/Kryptonews.git
cd Kryptonews
cp .env.example .env          # then edit the passwords and CONTACT_EMAIL
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d
```

Open **http://localhost:3000**. Prices appear within seconds, headlines within a minute. Click “Explore as a guest” to try every feature, including the editor's desk.

## Deploy on Coolify

1. **New resource → Docker Compose** from this repository (`/docker-compose.yml`).
2. **Domains:** give the `front` service `https://kryptonews.mbonnici.fr:3000`.
3. **Environment:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` and `CONTACT_EMAIL`. Every `SERVICE_PASSWORD_*` secret is generated by Coolify.
4. **Deploy**, then submit `https://kryptonews.mbonnici.fr/sitemap.xml` in Google Search Console.

The step-by-step guide (Google OAuth client, Cloudflare, notifications, backups, hardening, troubleshooting) is in **[doc/DEPLOYMENT.md](doc/DEPLOYMENT.md)**.

## Configuration

| Variable | Required | Description |
|---|---|---|
| `PUBLIC_URL` | yes | Public URL of the site (cookies, canonical URLs, sitemap, OAuth). Default `https://kryptonews.mbonnici.fr`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for editors | Google OAuth client used by the editor's entrance. |
| `ADMIN_EMAILS` | for editors | Comma-separated Google addresses allowed into the editor's desk. |
| `CONTACT_EMAIL` | recommended | Legal pages, feedback emails, forgotten passwords, push sender contact. |
| `SERVICE_PASSWORD_MARIADB` / `SERVICE_PASSWORD_MARIADBROOT` | yes* | Database passwords. |
| `SERVICE_PASSWORD_64_JWT` | yes* | Session signing secret (32+ characters). |
| `ADMIN_EMAIL` / `SERVICE_PASSWORD_ADMIN` | no | Optional break-glass editor with a password. |
| `ARTICLE_RETENTION_DAYS` | no | Days before headlines are deleted (default 45). |
| `SIGNUP_MAX_PER_HOUR` / `SIGNUP_MAX_PER_DAY` | no | Global caps on access requests, all IPs together (default 30 / 200); beyond them the form pauses. |
| `MAX_PENDING_REQUESTS` / `PENDING_REQUEST_DAYS` | no | Size of the waiting queue (default 100) and days before an unanswered request is deleted (default 30). |
| `MAX_ACCOUNTS` | no | Hard ceiling on reader accounts (default 5000). |
| `SIGNUP_POW_BITS` | no | Proof-of-work difficulty, 8 to 24 (default 16, about a second on a phone). |
| `COINGECKO_API_KEY` | no | Free CoinGecko *Demo* key for higher rate limits. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | no | Push keys; generated and stored automatically if empty. |
| `TRUST_CLOUDFLARE` | no | Use `CF-Connecting-IP` for rate limiting (default `true`). |

\* generated automatically by Coolify.

## Project structure

```
.
├── back/                 # Express 5 API: market sync, RSS, accounts, push, admin
│   ├── src/routes/       # auth, users, market, articles, favorites, admin, media, push
│   ├── src/services/     # CoinGecko, news, push, demo data, scheduler, seed
│   └── test/             # node:test unit tests (SSRF guards, tokens, guest mode, push)
├── front/                # Next.js 16 newspaper (PWA)
│   ├── messages/         # en.json / fr.json
│   ├── public/           # service worker, offline page, avatars, PWA screenshots
│   └── src/
│       ├── app/          # [locale] pages, API proxy, sitemap, robots, llms.txt, OG images
│       ├── components/   # chrome, markets, coin, news, favorites, account, admin, pwa, feedback
│       ├── content/      # legal pages (FR / EN)
│       └── styles/       # “Ledger Press” design system
├── doc/                  # deployment guide, screenshots, V1 design archive
├── .github/              # issue forms (bug report, feedback)
├── docker-compose.yml    # production stack (Coolify)
└── docker-compose.local.yml
```

## Development

```bash
cd back && npm install && npm test                                    # API unit tests
cd front && npm install && npm run typecheck && npm run check:i18n    # types + FR/EN key parity
```

Run the whole stack with Docker as shown above; the API needs MariaDB.

## Changelog

See **[CHANGELOG.md](CHANGELOG.md)** (MAJOR.MEDIUM.MINOR versioning).

## Credits

Kryptonews started in 2023 as a group project of the **Epitech MSc** programme:
[Maxence Bonnici](https://github.com/ImMaxence), Maxence Laporte, Matéo Salvy, Meriem Boussaid and Federico Suarez.
Version 2 (“Ledger Press”) is a complete redesign and rewrite by [Maxence Bonnici](https://mbonnici.fr).

Market data provided by [CoinGecko](https://www.coingecko.com). Headlines and images belong to their publishers.
Nothing on Kryptonews is financial advice.

## License

Released under the [MIT License](LICENSE): use it, fork it, learn from it, ship it, as long as the copyright notice stays. Headlines, article images and coin logos shown by the app belong to their respective owners and are not covered by this license.
