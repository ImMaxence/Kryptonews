module.exports = (sequelize, Sequelize) => {
    const RssFeeds = sequelize.define("rss_feeds", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name_rss_feed :{
            type: Sequelize.STRING,
        },
        url_rss_feed: {
            type: Sequelize.STRING,
        },
        parse_rss_feed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,  
        }
    });
    
    return RssFeeds;
};