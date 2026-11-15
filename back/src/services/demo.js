import { Article, Crypto } from '../db.js';
import { coinImage, tickerDto } from '../lib/dto.js';

/**
 * Fake data for the guest (demo) session. Real readers are never exposed to a
 * guest: the editor's desk shows these fictional people instead.
 */
const DAY = 86_400_000;

const READERS = [
  { username: 'ada.lovelace', role: 'admin', joined: 412, seen: 0.05 },
  { username: 'satoshi_n', role: 'user', joined: 388, seen: 1.2 },
  { username: 'hedy.lamarr', role: 'admin', joined: 301, seen: 0.4 },
  { username: 'grace.hopper', role: 'user', joined: 266, seen: 2.5 },
  { username: 'alan_turing', role: 'user', joined: 190, seen: 6 },
  { username: 'margaret.h', role: 'user', joined: 97, seen: 3.1 },
  { username: 'linus_t', role: 'user', joined: 44, seen: 12 },
  { username: 'hodl.julie', role: 'user', joined: 6, seen: 0.2 },
];

export function demoUsers(now = Date.now()) {
  return READERS.map((reader, index) => ({
    id: 9001 + index,
    username: reader.username,
    email: `${reader.username.replace(/[^a-z]/gi, '')}@example.com`,
    role: reader.role,
    googleLinked: reader.role === 'admin',
    createdAt: new Date(now - reader.joined * DAY),
    lastLoginAt: new Date(now - reader.seen * DAY),
  }));
}

const REQUESTS = [
  { firstName: 'Curie', lastName: 'Marie', locale: 'fr', hoursAgo: 3 },
  { firstName: 'Tim', lastName: 'Berners-Lee', locale: 'en', hoursAgo: 26 },
];

/** Fictional access requests for the demo desk. */
export function demoRequests(now = Date.now()) {
  return REQUESTS.map((request, index) => ({
    id: 9101 + index,
    firstName: request.firstName,
    lastName: request.lastName,
    email: `${request.firstName.toLowerCase()}.${request.lastName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
    locale: request.locale,
    createdAt: new Date(now - request.hoursAgo * 3_600_000),
  }));
}

export function demoCounts(real) {
  return { ...real, users: 1284, admins: 3 };
}

/** A believable scrapbook: recent real headlines and well-known coins, never saved anywhere. */
export async function demoFavorites(now = Date.now()) {
  const [articles, coins] = await Promise.all([
    Article.findAll({ order: [['publishedAt', 'DESC']], offset: 3, limit: 5 }),
    Crypto.findAll({ where: { id: ['bitcoin', 'ethereum', 'solana', 'ripple'] } }),
  ]);
  const clipped = articles.map((article, index) => ({
    id: -(index + 1),
    kind: 'article',
    refId: String(article.id),
    title: article.title,
    url: article.link,
    image: article.imageUrl ? `/api/media/article/${article.id}` : null,
    source: article.source,
    createdAt: new Date(now - (index * 1.7 + 0.2) * DAY),
    coin: null,
  }));
  const watched = coins.map((coin, index) => ({
    id: -(100 + index),
    kind: 'crypto',
    refId: coin.id,
    title: coin.name,
    url: null,
    image: coinImage(coin.id, 'small'),
    source: coin.symbol,
    createdAt: new Date(now - (index * 3 + 1) * DAY),
    coin: tickerDto(coin),
  }));
  return [...clipped, ...watched];
}
