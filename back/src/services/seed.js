import bcrypt from 'bcryptjs';
import { config, googleEnabled } from '../config.js';
import { Feed, User } from '../db.js';
import { log } from '../lib/log.js';

export const DEFAULT_FEEDS = [
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss', lang: 'en' },
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', lang: 'en' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed', lang: 'en' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml', lang: 'en' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/feed', lang: 'en' },
  { name: 'Journal du Coin', url: 'https://journalducoin.com/feed/', lang: 'fr' },
  { name: 'Cryptoast', url: 'https://cryptoast.fr/feed/', lang: 'fr' },
  { name: 'Coin Academy', url: 'https://coinacademy.fr/feed/', lang: 'fr' },
];

async function seedFeeds() {
  if ((await Feed.count()) > 0) return;
  await Feed.bulkCreate(DEFAULT_FEEDS.map((feed) => ({ ...feed, enabled: true })));
  log.info(`Seeded ${DEFAULT_FEEDS.length} default RSS feeds`);
}

/** Creates the first admin from ADMIN_* env vars. Never overwrites an existing password. */
async function seedAdmin() {
  const { username, email, password, googleEmails } = config.admin;
  if (googleEmails.length) log.info(`${googleEmails.length} editor email(s) granted through Google sign-in (ADMIN_EMAILS)`);
  if (!email || !password) {
    if ((await User.count({ where: { role: 'admin' } })) === 0 && !(googleEnabled() && googleEmails.length)) {
      log.warn('No editor account: set ADMIN_EMAIL + ADMIN_PASSWORD, or GOOGLE_CLIENT_* + ADMIN_EMAILS.');
    }
    return;
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.role !== 'admin') {
      await existing.update({ role: 'admin' });
      log.info(`Promoted ${email} to admin`);
    }
    return;
  }
  const taken = await User.findOne({ where: { username } });
  await User.create({
    username: taken ? `${username}-${Date.now().toString(36).slice(-4)}` : username,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
    avatar: 3,
  });
  log.info(`Created admin account ${email}`);
}

export async function seed() {
  await seedFeeds();
  await seedAdmin();
}
