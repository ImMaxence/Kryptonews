module.exports = app => {
    const articles = require("../controllers/articles.controller.js");
    var router = require("express").Router();

    router.get("/all", articles.all);
    router.get("/:id", articles.articlesById);

    app.use('/api/articles', router);
};