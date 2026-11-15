/** Serialisers: the only shapes that ever leave the API. */

export const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  locale: user.locale,
  hasPassword: Boolean(user.passwordHash),
  mustChangePassword: Boolean(user.mustChangePassword),
  googleLinked: Boolean(user.googleId),
  isGuest: Boolean(user.isGuest),
  createdAt: user.createdAt,
});

export const coinImage = (id, size = 'small') => `/api/media/coin/${encodeURIComponent(id)}?size=${size}`;

export const coinDto = (c) => ({
  id: c.id,
  symbol: c.symbol,
  name: c.name,
  image: c.image ? coinImage(c.id, 'small') : null,
  imageLarge: c.image ? coinImage(c.id, 'large') : null,
  rank: c.rank,
  listed: c.listed,
  price: c.price,
  marketCap: c.marketCap,
  volume24h: c.volume24h,
  high24h: c.high24h,
  low24h: c.low24h,
  change1h: c.change1h,
  change24h: c.change24h,
  change7d: c.change7d,
  circulatingSupply: c.circulatingSupply,
  totalSupply: c.totalSupply,
  maxSupply: c.maxSupply,
  ath: c.ath,
  athDate: c.athDate,
  sparkline: c.sparkline,
  updatedAt: c.sourceUpdatedAt ?? c.updatedAt,
});

export const tickerDto = (c) => ({
  id: c.id,
  symbol: c.symbol,
  name: c.name,
  price: c.price,
  change24h: c.change24h,
});

export const articleDto = (a) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  link: a.link,
  image: a.imageUrl ? `/api/media/article/${a.id}` : null,
  source: a.source,
  author: a.author,
  lang: a.lang,
  publishedAt: a.publishedAt,
});

export const favoriteDto = (f, coin) => ({
  id: f.id,
  kind: f.kind,
  refId: f.refId,
  title: f.title,
  url: f.url,
  image: f.kind === 'crypto' ? coinImage(f.refId, 'small') : f.image,
  source: f.source,
  createdAt: f.createdAt,
  coin: coin ? tickerDto(coin) : null,
});

export const feedDto = (f, articleCount = 0) => ({
  id: f.id,
  name: f.name,
  url: f.url,
  lang: f.lang,
  enabled: f.enabled,
  lastFetchedAt: f.lastFetchedAt,
  lastError: f.lastError,
  lastItemCount: f.lastItemCount,
  articleCount,
});
