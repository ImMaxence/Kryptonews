const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.anonymous = require("./anonymous.model.js")(sequelize, Sequelize);
db.cryptos = require("./cryptos.model.js")(sequelize, Sequelize);
db.articles = require("./articles.model.js")(sequelize, Sequelize);
db.rates = require("./rates.model.js")(sequelize, Sequelize);
db.rss_feeds = require("./rssFeeds.model.js")(sequelize, Sequelize);
db.favorites = require("./favorites.model.js")(sequelize, Sequelize);

db.history = require("./history.model.js")(sequelize, Sequelize);

module.exports = db;