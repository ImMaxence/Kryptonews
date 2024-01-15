const axios = require('axios');
const db = require("../models");
const Favorites = db.favorites;

exports.all = (req, res) => {
    Favorites.findAll().then(data =>{
        res.json(data);
    })
};

exports.allFavByUserId = (req, res) => {
    const userId = req.params.userId;
    Favorites.findAll({
        where: {
            id_user_fav: userId
        }
    })
    .then(data => {
        if (data.length === 0) {
            res.status(404).send({
                message: "No favorites found for the specified user ID"
            });
        } else {
            const favorites = data.map(fav => ({
                id: fav.id,
                id_user_fav: fav.id_user_fav,
                id_fav: fav.id_fav,
                name_fav: fav.name_fav,
                url_img_fav: fav.url_img_fav,
                url_source_fav : fav.url_source_fav,
                filtre_fav: fav.filtre_fav,
            }));

            res.status(200).send(favorites);
        }
    })
    .catch(err => {
        console.error("Error occurred while retrieving favorites:", err);
        res.status(500).send({
            message: "An error occurred while retrieving the favorites"
        });
    });
};


exports.create = (req, res) => {
    const userId = req.params.userId;
    const { id_fav, name_fav, url_img_fav,url_source_fav, filtre_fav } = req.body;
    Favorites.findOne({
        where: {
            name_fav: name_fav,
            id_user_fav : userId,
        }
    })
    .then(existingFav => {   
        if (existingFav) {
            res.status(409).json({ error: 'Favorite with the same name already exists' });
        } 
        else {
            return Favorites.create({
                id_fav : id_fav,
                id_user_fav : userId,
                name_fav: name_fav,
                url_img_fav: url_img_fav,
                url_source_fav: url_source_fav,
                filtre_fav: filtre_fav,
            });
        }
    }).then(newFav => {
        res.status(201).json(newFav);
    }).catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};



exports.delete = (req, res) => {
    const { id } = req.params;
    Favorites.destroy({
        where: { id: id }
    }).then(affectedRows => {
        if (affectedRows > 0) {
            res.status(200).json({
                message: "Favorite deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Favorite not found"
            });
        }
    }).catch(err => {
        console.error("Error deleting favorite:", err);
        res.status(500).json({
            message: "An error occurred while deleting the favorite",
            error: err.message || 'Internal Server Error'
        });
    });
};