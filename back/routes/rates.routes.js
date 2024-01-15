module.exports = app => {
    const rates = require("../controllers/rates.controller");
    var router = require("express").Router();

    router.get("/all", rates.all);
    router.get("/:symbol", rates.rateBysymbol);


    app.use('/api/rates', router);
};