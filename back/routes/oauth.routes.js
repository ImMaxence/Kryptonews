module.exports = app => {
    const oauth = require("../controllers/oauth.controller.js");
    var router = require("express").Router();

    router.post("/discord", oauth.discord);
    router.get("/discord/callback", oauth.discordCallback);

    app.use('/api/auth', router);
}; // http://presdechezmoi.eu:8080/api/auth/discord/callback