module.exports = app => {
    const rss_feeds = require("../controllers/rssFeeds.controller");
    var router = require("express").Router();   
    // CRUD
    router.get("/all", rss_feeds.all); 
    router.put("/update/:id", rss_feeds.update);
    router.post("/create", rss_feeds.create); 
    router.delete("/delete/:id", rss_feeds.delete);
    
    app.use('/api/rss_feeds', router);
};