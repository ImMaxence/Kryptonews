export type Role = 'user' | 'admin' | 'guest';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  avatar: number;
  locale: 'en' | 'fr';
  hasPassword: boolean;
  /** Signed in with a temporary password sent by the editors: should choose their own. */
  mustChangePassword?: boolean;
  googleLinked: boolean;
  /** Read-only demo session with fictional data. */
  isGuest: boolean;
  createdAt: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  imageLarge: string | null;
  rank: number | null;
  listed: boolean;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  high24h: number | null;
  low24h: number | null;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number | null;
  athDate: string | null;
  sparkline: number[];
  updatedAt: string | null;
}

export interface TickerItem {
  id: string;
  symbol: string;
  name: string;
  price: number | null;
  change24h: number | null;
}

export interface Mover extends TickerItem {
  image: string | null;
}

export interface MarketSummary {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number | null;
  up: number;
  down: number;
  gainers: Mover[];
  losers: Mover[];
}

export interface CoinList {
  items: Coin[];
  total: number;
  limited: boolean;
  limit: number | null;
  updatedAt: string | null;
  summary: MarketSummary;
}

export interface Rate {
  code: string;
  name: string;
  unit: string | null;
  type: string;
  perUsd: number;
}

export interface Article {
  id: number;
  title: string;
  summary: string | null;
  link: string;
  image: string | null;
  source: string;
  author: string | null;
  lang: 'en' | 'fr';
  publishedAt: string;
}

export interface ArticlePage {
  items: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  limited: boolean;
  limit: number | null;
}

export interface Source {
  name: string;
  lang: 'en' | 'fr';
}

export interface Favorite {
  id: number;
  kind: 'article' | 'crypto';
  refId: string;
  title: string;
  url: string | null;
  image: string | null;
  source: string | null;
  createdAt: string;
  coin: TickerItem | null;
}

export interface SiteConfig {
  version: string;
  google: boolean;
  /** Base64-encoded contact address for the feedback dialog (light anti-scraping). */
  contact?: string | null;
  guestCryptoLimit: number;
  guestNewsLimit: number;
  /** False when the editors closed access requests. */
  signupsOpen?: boolean;
}

export interface HistoryResponse {
  range: HistoryRange;
  prices: [number, number][];
}

export type HistoryRange = '1d' | '7d' | '30d' | '1y';

export interface SyncStatus {
  lastSuccess: string | null;
  lastError: string | null;
  count?: number;
  feeds?: number;
  items?: number;
}

export interface AdminOverview {
  counts: { users: number; admins: number; articles: number; feeds: number; coins: number };
  sync: { markets: SyncStatus; rates: SyncStatus; news: SyncStatus };
  settings: { guestCryptoLimit: number; guestNewsLimit: number; signupsOpen?: boolean };
  signups?: {
    open: boolean;
    pending: number;
    lastDay: number;
    maxPending: number;
    pendingDays: number;
    maxPerHour: number;
    maxPerDay: number;
    maxAccounts: number;
  };
  version: string;
  articleRetentionDays?: number;
  demo?: boolean;
}

export interface AdminFeed {
  id: number;
  name: string;
  url: string;
  lang: 'en' | 'fr';
  enabled: boolean;
  lastFetchedAt: string | null;
  lastError: string | null;
  lastItemCount: number | null;
  articleCount: number;
}

export interface AccessRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  locale: 'en' | 'fr';
  createdAt: string;
}

export interface AccessApproval {
  to: string;
  password: string;
  message: { subject: string; body: string };
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  googleLinked?: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
