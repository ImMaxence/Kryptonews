const db = require("../models");
const RssFeeds = db.rss_feeds;

exports.all = (req, res) => {
    RssFeeds.findAll().then(data =>{
        res.json(data);
    })
};



exports.create = (req, res) => {
    const { name_rss_feed,url_rss_feed, parse_rss_feed } = req.body;

    if (!name_rss_feed) {
        return res.status(400).json({ error: 'Missing required parameter: name_rss_feed' });
    }

    RssFeeds.findOne({
        where: {
            name_rss_feed: name_rss_feed,
        }
    })
    .then(existingRssFeed => {   
        if (existingRssFeed) {
            res.status(409).json({ error: 'RssFeed with the same name already exists' });
        } 
        else {
            return RssFeeds.create({
                name_rss_feed: name_rss_feed,
                url_rss_feed : url_rss_feed,
                parse_rss_feed:parse_rss_feed,
            });
        }
    }).then(newRssFeed => {
        res.status(201).json(newRssFeed);
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    });
};


exports.delete = (req, res) => {
    const { id } = req.params;
    RssFeeds.destroy({
        where: { id: id }
    }).then(affectedRows => {
        if (affectedRows > 0) {
            res.status(200).json({
                message: "Rss feed deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Rss feed not found"
            });
        }
    }).catch(err => {
        console.error("Error deleting rss feed:", err);
        res.status(500).json({
            message: "An error occurred while deleting the rss feed",
            error: err.message || 'Internal Server Error'
        });
    });
};

exports.update = (req, res) => {
    const id = req.params.id;
    const { name_rss_feed, url_rss_feed, parse_rss_feed } = req.body;

    RssFeeds.update(
        {
            name_rss_feed: name_rss_feed,
            url_rss_feed : url_rss_feed,
            parse_rss_feed: parse_rss_feed,
        },
        {
            where: {
                id: id,
            }
        }
    )
    .then(([rowsUpdated]) => {
        if (rowsUpdated === 0) {
            res.status(404).json({ error: 'RssFeeds not found' });
        } else {
            res.status(201).json({ success: true });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    });
};

