import { DataTypes, Sequelize } from 'sequelize';
import { config } from './config.js';
import { log } from './lib/log.js';

export const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: false,
  timezone: '+00:00',
  pool: { max: 10, min: 0, acquire: 30_000, idle: 10_000 },
  dialectOptions: { charset: 'utf8mb4' },
  define: {
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
});

/**
 * MariaDB stores JSON as LONGTEXT and mysql2 hands it back as a string,
 * so JSON columns are TEXT with an explicit (de)serialiser.
 */
const jsonColumn = (field, fallback) => ({
  type: DataTypes.TEXT('medium'),
  allowNull: true,
  get() {
    const raw = this.getDataValue(field);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(value) {
    this.setDataValue(field, value == null ? null : JSON.stringify(value));
  },
});

export const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(100), allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    avatar: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 1 },
    locale: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' },
    googleId: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    tokenVersion: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    // Set when an editor created the account with a temporary password (access request).
    mustChangePassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'users' },
);

export const Crypto = sequelize.define(
  'Crypto',
  {
    id: { type: DataTypes.STRING(100), primaryKey: true },
    symbol: { type: DataTypes.STRING(30), allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    image: { type: DataTypes.STRING(500), allowNull: true },
    rank: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    listed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    price: { type: DataTypes.DOUBLE, allowNull: true },
    marketCap: { type: DataTypes.DOUBLE, allowNull: true },
    volume24h: { type: DataTypes.DOUBLE, allowNull: true },
    high24h: { type: DataTypes.DOUBLE, allowNull: true },
    low24h: { type: DataTypes.DOUBLE, allowNull: true },
    change1h: { type: DataTypes.DOUBLE, allowNull: true },
    change24h: { type: DataTypes.DOUBLE, allowNull: true },
    change7d: { type: DataTypes.DOUBLE, allowNull: true },
    circulatingSupply: { type: DataTypes.DOUBLE, allowNull: true },
    totalSupply: { type: DataTypes.DOUBLE, allowNull: true },
    maxSupply: { type: DataTypes.DOUBLE, allowNull: true },
    ath: { type: DataTypes.DOUBLE, allowNull: true },
    athDate: { type: DataTypes.DATE, allowNull: true },
    sparkline: jsonColumn('sparkline', []),
    sourceUpdatedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'cryptos', indexes: [{ fields: ['listed', 'rank'] }] },
);

export const Rate = sequelize.define(
  'Rate',
  {
    code: { type: DataTypes.STRING(12), primaryKey: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    unit: { type: DataTypes.STRING(12), allowNull: true },
    type: { type: DataTypes.STRING(16), allowNull: false },
    valuePerBtc: { type: DataTypes.DOUBLE, allowNull: false },
  },
  { tableName: 'rates' },
);

export const Feed = sequelize.define(
  'Feed',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    url: { type: DataTypes.STRING(500), allowNull: false, unique: true },
    lang: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    lastFetchedAt: { type: DataTypes.DATE, allowNull: true },
    lastError: { type: DataTypes.STRING(500), allowNull: true },
    lastItemCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  },
  { tableName: 'feeds' },
);

export const Article = sequelize.define(
  'Article',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    uid: { type: DataTypes.CHAR(40), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(500), allowNull: false },
    summary: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.STRING(1000), allowNull: false },
    imageUrl: { type: DataTypes.STRING(1000), allowNull: true },
    author: { type: DataTypes.STRING(200), allowNull: true },
    source: { type: DataTypes.STRING(80), allowNull: false },
    lang: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' },
    publishedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: 'articles', indexes: [{ fields: ['published_at'] }, { fields: ['lang', 'published_at'] }] },
);

export const Favorite = sequelize.define(
  'Favorite',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    kind: { type: DataTypes.ENUM('article', 'crypto'), allowNull: false },
    refId: { type: DataTypes.STRING(100), allowNull: false },
    title: { type: DataTypes.STRING(500), allowNull: false },
    url: { type: DataTypes.STRING(1000), allowNull: true },
    image: { type: DataTypes.STRING(1000), allowNull: true },
    source: { type: DataTypes.STRING(80), allowNull: true },
  },
  {
    tableName: 'favorites',
    indexes: [{ unique: true, fields: ['user_id', 'kind', 'ref_id'] }],
  },
);

export const Setting = sequelize.define(
  'Setting',
  {
    key: { type: DataTypes.STRING(64), primaryKey: true },
    value: jsonColumn('value', null),
  },
  { tableName: 'settings' },
);

/** Web Push subscription (opt-in notifications). Linked to an account when signed in. */
/**
 * Access requests: readers do not create accounts themselves. A request only holds what an
 * editor needs to answer it, and is deleted once approved, declined or PENDING_SIGNUP_DAYS old.
 */
export const AccessRequest = sequelize.define(
  'AccessRequest',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
    firstName: { type: DataTypes.STRING(60), allowNull: false },
    lastName: { type: DataTypes.STRING(60), allowNull: false },
    locale: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' },
  },
  { tableName: 'access_requests', updatedAt: false },
);

export const PushSubscription = sequelize.define(
  'PushSubscription',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    endpointHash: { type: DataTypes.CHAR(40), allowNull: false, unique: true },
    endpoint: { type: DataTypes.TEXT, allowNull: false },
    p256dh: { type: DataTypes.STRING(200), allowNull: false },
    auth: { type: DataTypes.STRING(100), allowNull: false },
    locale: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' },
    topics: jsonColumn('topics', []),
    alerts: jsonColumn('alerts', {}),
    lastDigestAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'push_subscriptions' },
);

Feed.hasMany(Article, { foreignKey: { name: 'feedId', allowNull: true }, onDelete: 'CASCADE' });
User.hasMany(PushSubscription, { foreignKey: { name: 'userId', allowNull: true }, onDelete: 'CASCADE' });
PushSubscription.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true } });
Article.belongsTo(Feed, { foreignKey: { name: 'feedId', allowNull: true } });
User.hasMany(Favorite, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });

/** MariaDB may still be starting when the API boots: retry instead of crashing. */
export async function connectWithRetry({ attempts = 30, delayMs = 2000 } = {}) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await sequelize.authenticate();
      log.info(`Database connected (${config.db.host}:${config.db.port}/${config.db.name})`);
      return;
    } catch (err) {
      log.warn(`Database not ready (attempt ${i}/${attempts}): ${err.message}`);
      if (i === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Additive migrations: `sync()` creates missing tables but never touches existing
 * ones, so columns introduced by a new release are added here (nullable only).
 */
async function addMissingColumns() {
  const qi = sequelize.getQueryInterface();
  for (const model of Object.values(sequelize.models)) {
    const table = model.getTableName();
    const existing = await qi.describeTable(table);
    for (const [name, attribute] of Object.entries(model.rawAttributes)) {
      const field = attribute.field || name;
      if (existing[field]) continue;
      await qi.addColumn(table, field, {
        type: attribute.type,
        allowNull: attribute.allowNull !== false,
        defaultValue: attribute.defaultValue,
      });
      if (attribute.unique) await qi.addIndex(table, [field], { unique: true, name: `${table}_${field}_unique` });
      log.info(`Migration: added column ${table}.${field}`);
    }
  }
}

export async function syncSchema() {
  await sequelize.sync({ alter: config.db.alter });
  if (!config.db.alter) await addMissingColumns();
  log.info(`Schema synchronised${config.db.alter ? ' (alter mode)' : ''}`);
}
