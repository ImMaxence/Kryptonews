const db = require("../models");
const Articles = db.articles;


exports.articlesById = (req, res) => {
    const id_req = req.params.id;
    Articles.findByPk(id_req).then(data => {
        res.status(200).send({
            id: data.id,
            articles_title: data.articles_title,
            articles_summary: data.articles_summary,
            articles_source: data.articles_source,
            articles_date: data.articles_date,
            url_articles: data.url_articles,
            url_img_articles: data.url_img_articles
        });
    }).catch(err => {
        res.status(500).send({
            message: "An error occurred while retrieving the article"
        });
    });
};

exports.all = (req, res) => {
    Articles.findAll().then(data => {
        res.json(data);
    }).catch(err => {
        console.error("Error fetching articles:", err);
        res.status(500).json({ error: "Internal Server Error" });
    });
};
