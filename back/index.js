// =========== IMPORT =========== \\
const express = require('express');
const cors = require("cors");
const fillArticlesData = require("./db/autoRssDb.js");
const fillCryptoData = require("./db/autoFillCryptoDb.js");
const fillRateData = require("./db/autoFillRatesDb.js");
const fillHistoryData = require("./db/autoFillHistoryDb.js");
const axios = require('axios');
// npm i node-cron
const cron = require('node-cron');

// npm i rss-to-json
// =========== CONFIG =========== \\
var corsOptions = {
    origin: '*'
};

// =========== USE =========== \\
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded());

// =========== BDD =========== \\

const db = require("./models");
// =========== Migrate DB and Seed =========== \\
const runMigrationsAndSeed = async () => {
    try {
        await db.sequelize.sync({ force: false });
        console.log("Tables created.");

        // =========== SEED =========== \\
        const anonymousSeed = async () => {
            try {
                const existingEntry = await db.anonymous.findOne({
                    where: {
                        nb_crypto: 5,
                        nb_feed: 5
                    }
                });

                if (!existingEntry) {
                    await db.anonymous.create({
                        nb_crypto: 5,
                        nb_feed: 5
                    });
                    console.log("Anonymous seed data added.");
                }
            } catch (err) {
                console.error('Error adding anonymous seed data:', err);
            }
        };

        const userSeed = async () => {
            try {
                const existingEntry = await db.user.findOne({
                    where: {
                        username: "Admin",
                    }
                });

                if (!existingEntry) {
                    await db.user.create({
                        username: "Admin",
                        email: "admin@test.fr",
                        password: "$2a$10$ZGp58hX5jAhLd.ngM7goZuW3J3jpjQOd5Qs7Jo9X6z9dDD9TTEt1S", //admin123
                        role: 1,
                        profilePicture: 3,
                    });
                    console.log("User seed data added.");
                }
            } catch (err) {
                console.error('Error adding user seed data:', err);
            }
        };

        const rssFeedsSeed = async () => {
            try {
                const existingEntry = await db.rss_feeds.findOne({
                    where: {
                        name_rss_feed: "Cointelegraph",
                        url_rss_feed: "https://cointelegraph.com/rss",
                        parse_rss_feed: true,
                    }
                });

                if (!existingEntry) {
                    await db.rss_feeds.create({
                        name_rss_feed: "Cointelegraph",
                        url_rss_feed: "https://cointelegraph.com/rss",
                        parse_rss_feed: true,
                    });
                    console.log("RSS feeds seed data added.");
                }
            } catch (err) {
                console.error('Error adding RSS feeds seed data:', err);
            }
        };

        await anonymousSeed();
        await userSeed();
        await rssFeedsSeed();
    } catch (migrationErr) {
        console.error("Migration error:", migrationErr);
    }
};

runMigrationsAndSeed();


// db.sequelize.sync().then(() => {
//     console.log("Drop and re-sync db.");
// }).catch((err) => {
//     console.log("Failed to sync db: " + err.message);
// });

// =========== ROUTES =========== \\
require("./routes/user.routes.js")(app);
require("./routes/anonymous.routes.js")(app);
require("./routes/oauth.routes.js")(app);
require("./routes/cryptos.routes.js")(app);
require("./routes/articles.routes.js")(app);
require("./routes/rates.routes.js")(app);
require("./routes/rssFeeds.routes.js")(app);
require("./routes/favorites.routes.js")(app);

//---------------------------------------------------


//const rssURL = 'https://cointelegraph.com/rss';


const recoverRssData = async () => {
    //  console.log(`je suis laaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa `);
    try {
        const data = await db.rss_feeds.findAll();
        if (data && data.length > 0) {
            data.forEach(async (rssFeed) => {
                if (rssFeed.parse_rss_feed === true) {
                    //console.log(`data--------------------------------------------->${rssFeed.name_rss_feed}-------------${rssFeed.parse_rss_feed}///`);
                    await fillArticlesData(rssFeed.url_rss_feed);
                }
            });
        }
    } catch (error) {
        console.error("Error recovering RSS data:", error);
    }
};

// cron.schedule('*/15 * * * *', () => {
cron.schedule('*/2 * * * *', () => {
    console.log('Looking for API data every 2m');
    fillCryptoData();
    console.log('---------------------------------------> data Crypto ok');
    //on a plus besoin fillArticlesData(rssURL);
    recoverRssData();
    console.log('---------------------------------------> data Articles ok');
    fillRateData();
    console.log('---------------------------------------> data rates ok');
});

cron.schedule('*/1 * * * *', () => {
    fillHistoryData();
    console.log('---------------------------------------> data history ok');
});

// =========== SWAGGER =========== \\
app.get('/', async (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Non Autorized!</title>
    </head>
    <body>
        <h1>HELLO WORLD!!</h1>
        <a href="http://localhost:80">!!Kryptonews ici!!</a>
    </body>
    </html>
`;
res.send(htmlContent);
});


// =========== LISTEN =========== \\
const port = 8080;
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
