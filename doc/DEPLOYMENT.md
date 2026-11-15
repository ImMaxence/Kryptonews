# Deploying Kryptonews on Coolify

This guide deploys the full stack (`db` + `back` + `front`) from this repository with Coolify v4, on a self-hosted server behind Cloudflare, at **https://kryptonews.mbonnici.fr**.

Only the `front` container is published. The API and MariaDB stay on Coolify's internal network.

## 1. Prerequisites

- A server with Coolify v4 (beta 411 or newer, for generated secrets in Git-based Compose apps) and ports 80/443 reachable.
- A DNS record `kryptonews` in the `mbonnici.fr` zone pointing to the server (Cloudflare proxied, as for your other apps).
- Cloudflare SSL/TLS mode **Full (strict)**: Coolify's Traefik obtains a Let's Encrypt certificate for the domain.
- HTTPS is mandatory for the installable app and push notifications (Cloudflare + Coolify provide it).

## 2. Create the resource

1. **Projects → (your project) → + New → Public/Private Repository** (GitHub App or deploy key).
2. Repository `ImMaxence/Kryptonews`, branch `main`.
3. **Build pack: Docker Compose**, Base directory `/`, Docker Compose location `/docker-compose.yml`.
4. Click **Load compose file**. Coolify detects the services `db`, `back` and `front`.

## 3. Domain

In **Domains**, set it on the `front` service only:

```
https://kryptonews.mbonnici.fr:3000
```

The `:3000` tells Traefik which container port to route to; visitors still use the normal 443 port. Leave `back` and `db` without a domain.

## 4. Google sign-in for editors

Readers **request access** (first name, last name, email); you approve them on the editor's desk, which creates the account with a temporary password and prepares the email to send. **Editors sign in with Google only**, and only the addresses you list are accepted.

1. [Google Cloud console](https://console.cloud.google.com/) → create (or pick) a project → **APIs & Services → OAuth consent screen**: External, app name “Kryptonews”, your support email, authorized domain `mbonnici.fr`. Scopes: `openid`, `email`, `profile` (non-sensitive, no verification needed).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   - Authorized JavaScript origin: `https://kryptonews.mbonnici.fr`
   - Authorized redirect URI: `https://kryptonews.mbonnici.fr/api/auth/google/callback`
3. Copy the client ID and secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (section 5), and put your Google address in `ADMIN_EMAILS`.

The editor's entrance is linked in the footer (“Editor's entrance”) and lives at `/fr/redaction` (`/en/editors-desk`).

## 5. Environment variables

In the **Environment Variables** tab:

| Variable | Value |
|---|---|
| `PUBLIC_URL` | `https://kryptonews.mbonnici.fr` (already the default). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | From section 4. |
| `ADMIN_EMAILS` | Comma-separated Google addresses allowed into the editor's desk, e.g. `you@gmail.com, colleague@gmail.com`. |
| `CONTACT_EMAIL` | Your contact address: legal pages, the “Feedback or a bug?” email button, forgotten-password requests, and the sender contact for push notifications. It is never committed to the repository. |
| `SERVICE_PASSWORD_MARIADB`, `SERVICE_PASSWORD_MARIADBROOT`, `SERVICE_PASSWORD_64_JWT`, `SERVICE_PASSWORD_ADMIN` | Generated automatically by Coolify. Keep them. |
| `ADMIN_EMAIL` | Optional break-glass editor with a password (`SERVICE_PASSWORD_ADMIN`). Leave empty if Google sign-in is enough. |
| `ARTICLE_RETENTION_DAYS` | Optional, default `45`. Headlines older than this are deleted daily (about 15 MB at 45 days; a year stays under ~100 MB). |
| `SIGNUP_MAX_PER_HOUR`, `SIGNUP_MAX_PER_DAY` | Optional, default `30` / `200`. Global caps on access requests (all IPs together); beyond them the form pauses by itself. |
| `MAX_PENDING_REQUESTS`, `PENDING_REQUEST_DAYS` | Optional, default `100` / `30`. At most this many requests wait in the queue; unanswered ones are deleted after this many days. |
| `MAX_ACCOUNTS` | Optional, default `5000`. Hard ceiling on reader accounts. |
| `SIGNUP_POW_BITS` | Optional, default `16`. Difficulty of the invisible anti-robot calculation (8–24; each +1 doubles the work). |
| `COINGECKO_API_KEY` | Optional free CoinGecko *Demo* key for a higher rate limit. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Optional. Push notification keys are generated at first start and stored in the database; set these only to pin your own keys. |

## 6. Deploy

Click **Deploy**. The first build takes a few minutes (Next.js build, fonts downloaded at build time). Then:

1. MariaDB initialises the `kryptonews` database (volume `db_data`).
2. The API creates or migrates the schema, seeds the 8 default newsrooms and generates the push notification keys.
3. Prices appear within seconds, headlines within a minute.

All three services expose health checks, so Coolify shows the stack as *Healthy* once everything is up. Sign in as an editor from the footer's “Editor's entrance” with your Google account.

## 7. Search engines and AI assistants

1. Open [Google Search Console](https://search.google.com/search-console), add the property `https://kryptonews.mbonnici.fr/` (or verify the whole `mbonnici.fr` domain through a Cloudflare DNS TXT record).
2. **Sitemaps → Add a new sitemap →** `sitemap.xml` → Submit. It lists every page in both languages and the 100 coin pages.
3. Recommended: in [Bing Webmaster Tools](https://www.bing.com/webmasters), import the site from Search Console. Bing's index also feeds Copilot and several AI search engines.
4. Nothing to do for AI crawlers: `robots.txt` already allows them, and `/llms.txt` and `/llms-full.txt` are live.

## 8. App and notifications

- On Android and desktop Chrome/Edge, the bell opens “Install Kryptonews”. On iPhone/iPad, use Share → Add to Home Screen; iOS only allows web push for installed apps.
- Notifications are opt-in from the bell. The server checks every 10 minutes (market alerts) and sends the morning edition once a day after 8:00 Paris time.
- Quick check after deployment: open the site, click the bell, turn on notifications, then wait for the next alert or morning edition.

## 9. Access requests and forgotten passwords

### Access requests

New requests appear at the top of the editor's desk. **Approve** creates the account and shows the message to send (in the reader's language: login link, email, temporary password); **Write the email** opens it in your mail client, **Copy the message** puts it on the clipboard. The temporary password is shown only once. **Decline** deletes a request; **Decline all** clears the queue after a wave of junk. Untick **Accept new access requests** to close the form entirely.

Optional outer layer on Cloudflare (free plan): *Security → Bots → Bot Fight Mode*, and a rate-limiting rule on `/api/auth/access-request` (for example 5 requests per 10 minutes per IP).

### Forgotten passwords

Readers write to `CONTACT_EMAIL` from their account address. On the editor's desk, the **Reset link** button next to the reader creates a single-use link valid for one hour: send it **only to the account's email address**.

## 10. Updates

Push to `main`. With the GitHub App, Coolify redeploys automatically (otherwise click **Redeploy**). The database lives in the `db_data` volume and survives redeploys; new columns are added automatically. Record every release in `CHANGELOG.md` and bump the `version` in `back/package.json`, `front/package.json` and `front/public/sw.js`.

## 11. Backups

The database is embedded in the Compose stack, so back it up from the server:

```bash
# Find the db container name (Coolify prefixes it with the resource id)
docker ps --filter "name=db-" --format "{{.Names}}"

# Dump (the root password is SERVICE_PASSWORD_MARIADBROOT)
docker exec <db-container> sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" kryptonews' | gzip > kryptonews-$(date +%F).sql.gz

# Restore
gunzip -c kryptonews-YYYY-MM-DD.sql.gz | docker exec -i <db-container> sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" kryptonews'
```

Only accounts, clippings and notification subscriptions really need backing up: market data and headlines are re-fetched automatically.

## 12. Hardening checklist

- Allow only [Cloudflare IP ranges](https://www.cloudflare.com/ips/) on ports 80/443 of the home router or firewall (or use a Cloudflare Tunnel), so `CF-Connecting-IP` cannot be spoofed. Otherwise set `TRUST_CLOUDFLARE=false`.
- Once Google sign-in works, leave `ADMIN_EMAIL` empty (or keep its generated password secret).
- Keep Coolify and the server's OS up to date; redeploy regularly to pick up new Node/Alpine base images.

## 13. Troubleshooting

| Symptom | Fix |
|---|---|
| *No available server* | The domain must include `:3000` and be attached to `front`. Check that the `front` container is healthy. |
| `back` restarts with “JWT_SECRET must be set” | `SERVICE_PASSWORD_64_JWT` is empty: reload the compose file so Coolify generates it, or set 32+ random characters. |
| Google says `redirect_uri_mismatch` | The redirect URI in the Google console must be exactly `https://kryptonews.mbonnici.fr/api/auth/google/callback`. |
| “This Google address is not on the editors' list” | Add it to `ADMIN_EMAILS` (comma-separated) and redeploy. |
| Prices missing, logs show `CoinGecko … 429` | The public API is rate-limited: wait, or add a free `COINGECKO_API_KEY`. |
| A newsroom shows an error on the editor's desk | The publisher blocked or moved its feed. Pause it or update its URL. |
| Login works locally but not in production | `PUBLIC_URL` must be the exact public https URL (it drives secure cookies and origin checks). |
| “Web Push disabled” in the API logs | Set `CONTACT_EMAIL` (or an https `PUBLIC_URL`): push services require a sender contact. |

## Local run (Docker Desktop)

```bash
cp .env.example .env    # edit the passwords; set CONTACT_EMAIL
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d
# http://localhost:3000
```
