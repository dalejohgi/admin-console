const { Sequelize, DataTypes } = require('sequelize');
const { DBHOST, DBNAME_ESIMVAULT, DBNAME_CUSTOMERS, DBPASS, DBUSER }  =  process.env;
const esimsModels = require('./models');
const customersModels = require('./models');



const esimVault = new Sequelize({
    username: DBUSER,
    password: DBPASS,
    database: DBNAME_ESIMVAULT,
    port: 3306,
    host: DBHOST,
    dialect: 'mysql'
});
const customers = new Sequelize({
    username: DBUSER,
    password: DBPASS,
    database: DBNAME_CUSTOMERS,
    port: 3306,
    host: DBHOST,
    dialect: 'mysql'
});

db = {esimVault, customers};

for (const modelName in db) {
	db[modelName].loadScopes && db[modelName].loadScopes(db);
	db[modelName].associate && db[modelName].associate(db);
}

module.exports = db;