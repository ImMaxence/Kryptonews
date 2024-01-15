module.exports = (sequelize, Sequelize) => {
    const Cryptos = sequelize.define("cryptos", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_name_crypto:{
            type: Sequelize.STRING,
        },
        rank_crypto: {
            type: Sequelize.INTEGER,
        },
        symbol_crypto: {
            type: Sequelize.STRING,
        },
        name_crypto: {
            type: Sequelize.STRING,
        },
        url_img_crypto: {
            type: Sequelize.STRING,
        },
        priceUsd_crypto:{
            type: Sequelize.FLOAT,
        },
        volumeUsd24Hr_crypto:{
            type: Sequelize.FLOAT,
        }
    });

    return Cryptos;
};