module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: Sequelize.STRING,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        password: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        profilePicture: {
            type: Sequelize.INTEGER
        },
        oauth: {
            type: Sequelize.STRING
        },
        connect: {
            type: Sequelize.BOOLEAN
        }
    });

    return User;
};