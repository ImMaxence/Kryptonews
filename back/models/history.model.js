module.exports = (sequelize, Sequelize) => {
    const History = sequelize.define("history", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_name_crypto:{
            type: Sequelize.STRING,
        },
        history_1hrs:{
            type: Sequelize.FLOAT,
        },
        history_24hrs:{
            type: Sequelize.FLOAT,
        },
        history_7jours:{
            type: Sequelize.FLOAT
        }
        
    });
    return History;
};