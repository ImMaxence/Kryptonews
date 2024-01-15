module.exports = app => {
    const cryptos = require("../controllers/cryptos.controller");
    var router = require("express").Router();

    
    
    // CRUD
    router.put("/update", cryptos.update);
    
    //fait
    router.get("/all", cryptos.all); //ok
    router.get("/:id", cryptos.byId);//ok
    router.post("/create", cryptos.create); //ok
    router.delete("/delete/:id", cryptos.delete); //ok
    // mandatories
    router.get("/list/:idList", cryptos.byIdsList);//ok 
    //  cmid = id_name_crypto dans notre base de donnes
    //  valid period: m1, m5, m15, m30, h1, h2, h6, h12, d1
    router.get("/:cmid/history/:period", cryptos.byIdHistoryPeriod); //ok
    
    app.use('/api/cryptos', router);
};