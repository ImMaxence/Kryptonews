const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { parse } = require('rss-to-json');
const db = require("../models");
const Articles = db.articles;


//notre->
//const rssURL = 'https://cointelegraph.com/rss';
// const rssURL = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
// TODO test:
// CoinDesk: https://www.coindesk.com/
// Flux RSS exemple : https://www.coindesk.com/feed

// CoinTelegraph: https://cointelegraph.com/
// Flux RSS exemple : https://cointelegraph.com/rss

// NewsBTC: https://www.newsbtc.com/
// Flux RSS exemple : https://www.newsbtc.com/feed/

// Bitcoin Magazine: https://bitcoinmagazine.com/
// Flux RSS exemple : https://bitcoinmagazine.com/feed

// CryptoSlate: https://cryptoslate.com/
// Flux RSS exemple : https://cryptoslate.com/feed/

const fetchRssData = async (rssURL) => {
    try {
        const apiResponse = await parse(rssURL);
        const data = apiResponse.items;
        //console.log('Rss Data  fetched:', data);
        return data; 
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error; 
    }
};

const fillArticlesData = async (rssURL) => {
    try {
        const articlesData = await fetchRssData(rssURL);

        for (const article of articlesData) {
            const existingArticle = await Articles.findOne({
                where: {
                    articles_title: article.title,
                },
            });
            if (!existingArticle) {
                // const description = article.description;
                const $ = cheerio.load(article.description);
                const lastParagraph = $('p').last().text().trim();

                const images = article.enclosures || [];
                const imageUrl = images.length > 0 ? images[0].url : null;

                await Articles.create({
                    articles_title: article.title,
                     articles_summary: lastParagraph || article.description,
                    //articles_summary: lastParagraph,
                    articles_source: article.author,
                    articles_date: article.published,
                    url_articles: article.id,
                    url_img_articles: imageUrl || article.images,
                });
            }
        }

        return Articles;
    } catch (error) {
        console.error('Error filling Articles data:', error.message);
        throw error;
    }
};

module.exports = fillArticlesData;