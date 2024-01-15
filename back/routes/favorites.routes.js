module.exports = app => {
    const favorites = require("../controllers/favorites.controller");
    var router = require("express").Router();

    // CRUD
    router.get("/all", favorites.all); 
    router.get("/favorites/:userId", favorites.allFavByUserId);  
    router.delete("/delete/:id", favorites.delete);
    router.post("/create/:userId", favorites.create); 

    app.use('/api/favorites', router);
};