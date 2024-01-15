module.exports = app => {
    const anonymous = require("../controllers/anonymous.controller.js");
    var router = require("express").Router();

    router.get("/profile", anonymous.profileGet);
    router.put("/profile", anonymous.profilePut);

    app.use('/api/anonymous', router);
};