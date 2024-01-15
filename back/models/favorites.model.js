module.exports = (sequelize, Sequelize) => {
    const Favorites = sequelize.define("favorites", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_user_fav:{
            type: Sequelize.INTEGER,
        },
        id_fav:{
            type: Sequelize.INTEGER,
        },
        name_fav: {
            type: Sequelize.STRING,
        },
        url_img_fav: {
            type: Sequelize.STRING,
        },
        url_source_fav: {
            type: Sequelize.STRING,
        },
        filtre_fav:{
            type: Sequelize.STRING,
            defaultValue: "crypto",  
        }
    });

    return Favorites;
};