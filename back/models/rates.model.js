module.exports = (sequelize, Sequelize) => {
    const Rates = sequelize.define("rates", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name_rate: {
            type: Sequelize.STRING
        },
        symbol_rate: {
            type: Sequelize.STRING
        },
        currencySymbol_rate: {
            type: Sequelize.STRING
        },
        rateUsd_rate :{
            type : Sequelize.FLOAT
        },
    });

    return Rates;
};