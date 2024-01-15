require('dotenv').config();
const host = process.env.MYSQL_HOST
const user = process.env.MYSQL_USER
const password = process.env.MYSQL_PASSWORD
const db = process.env.MYSQL_DATABASE

module.exports = {
    HOST: host,
    USER: user,
    PASSWORD: password,
    DB: db,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};