import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { Op } from 'sequelize';
import { config } from '../config.js';
import { Article, Feed } from '../db.js';
import { log } from '../lib/log.js';
import { safeFetch } from '../lib/http.js';
import { syncState } from '../lib/settings.js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

const MAX_ITEMS_PER_FEED = 50;

const sha1 = (value) => createHash('sha1').update(value).digest('hex');

/** Decode entities and strip any markup from a short string. */
export function plainText(value) {
  if (!value) return '';
  const text = cheerio.load(`<div>${String(value)}</div>`)('div').text();
  return text.replace(/\s+/g, ' ').trim();
}

/** Build a ~300 character teaser from RSS HTML, dropping WordPress boilerplate. */
export function summarize(html, max = 320) {
  const text = plainText(html)
    .replace(/The post .+? appeared first on .+?\.?$/i, '')
    .replace(/L['’]article .+? est apparu en premier sur .+?\.?$/i, '')
    .replace(/Cet article .+? est apparu en premier sur .+?\.?$/i, '')
    .replace(/\[(?:…|\.\.\.)\]\s*$/, '')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 200 ? cut.lastIndexOf(' ') : max).replace(/[,.;:!?\s]+$/, '')}…`;
}

const looksLikeImage = (url, type) =>
  (type && type.startsWith('image/')) || /\.(?:jpe?g|png|webp|gif|avif)(?:[?#]|$)/i.test(url || '');

function absolute(url, base) {
  try {
    const resolved = new URL(url, base);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.toString() : null;
  } catch {
    return null;
  }
}

export function extractImage(item) {
  const candidates = [];
  if (item.enclosure?.url && looksLikeImage(item.enclosure.url, item.enclosure.type)) {
    candidates.push(item.enclosure.url);
  }
  for (const media of item.mediaContent ?? []) {
    const attrs = media?.$ ?? {};
    if (attrs.url && (attrs.medium === 'image' || looksLikeImage(attrs.url, attrs.type))) candidates.push(attrs.url);
  }
  for (const thumb of item.mediaThumbnail ?? []) {
    if (thumb?.$?.url) candidates.push(thumb.$.url);
  }
  const html = item.contentEncoded || item.content || '';
  if (html.includes('<img')) {
    const src = cheerio.load(html)('img').first().attr('src');
    if (src) candidates.push(src);
  }
  for (const candidate of candidates) {
    const url = absolute(candidate, item.link);
    if (url && url.length <= 1000) return url;
  }
  return null;
}

function parseDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return new Date();
  return date > new Date() ? new Date() : date;
}

/** Fetch one feed and insert the new items. Never throws: errors are stored on the feed row. */
export async function fetchFeed(feed) {
  try {
    const { response, body } = await safeFetch(feed.url, {
      timeout: 20_000,
      headers: { accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const parsed = await parser.parseString(body.toString('utf8'));
    const cutoff = Date.now() - config.articleRetentionDays * 86_400_000;
    const rows = [];

    for (const item of (parsed.items ?? []).slice(0, MAX_ITEMS_PER_FEED)) {
      const link = absolute(item.link?.trim(), feed.url);
      const title = plainText(item.title).slice(0, 500);
      if (!link || !title || link.length > 1000) continue;
      const publishedAt = parseDate(item.isoDate || item.pubDate);
      if (publishedAt.getTime() < cutoff) continue;

      rows.push({
        uid: sha1(`${feed.id}:${item.guid || link}`),
        feedId: feed.id,
        title,
        summary: summarize(item.contentSnippet || item.summary || item.content || item.contentEncoded) || null,
        link,
        imageUrl: extractImage(item),
        author: plainText(item.creator || item.author).slice(0, 200) || null,
        source: feed.name,
        lang: feed.lang,
        publishedAt,
      });
    }

    if (rows.length) await Article.bulkCreate(rows, { ignoreDuplicates: true });
    await feed.update({ lastFetchedAt: new Date(), lastError: null, lastItemCount: rows.length });
    return rows.length;
  } catch (err) {
    const message = err?.cause?.code || err?.message || 'unknown error';
    log.warn(`Feed "${feed.name}" failed: ${message}`);
    await feed.update({ lastFetchedAt: new Date(), lastError: String(message).slice(0, 500) });
    return 0;
  }
}

export async function syncNews() {
  const feeds = await Feed.findAll({ where: { enabled: true } });
  let total = 0;
  // Small concurrency: polite to publishers and quick enough.
  for (let i = 0; i < feeds.length; i += 3) {
    const counts = await Promise.all(feeds.slice(i, i + 3).map(fetchFeed));
    total += counts.reduce((sum, n) => sum + n, 0);
  }
  syncState.news = { lastSuccess: new Date(), lastError: null, feeds: feeds.length, items: total };
  return total;
}

export async function pruneArticles() {
  const cutoff = new Date(Date.now() - config.articleRetentionDays * 86_400_000);
  return Article.destroy({ where: { publishedAt: { [Op.lt]: cutoff } } });
}
