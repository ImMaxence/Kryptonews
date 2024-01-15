module.exports = (sequelize, Sequelize) => {
    const Anonymous = sequelize.define("anonymous", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nb_crypto: {
            type: Sequelize.INTEGER,
            defaultValue: 5
        },
        nb_feed: {
            type: Sequelize.INTEGER,
            defaultValue: 5
        }
    });

    return Anonymous;
};