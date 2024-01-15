module.exports = (sequelize, Sequelize) => {
    const Articles = sequelize.define("articles", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        articles_title: {
            type: Sequelize.STRING,
        },
        articles_summary: {
            type: Sequelize.TEXT,
        },
        articles_source: {
            type: Sequelize.STRING,
        },
        articles_date: {
            type: Sequelize.DATE,
        },
        url_articles: {
            type: Sequelize.STRING,
        },
        url_img_articles: {
            type: Sequelize.STRING,
        }
    });

    return Articles;
};