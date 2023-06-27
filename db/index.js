const { Sequelize, DataTypes } = require('sequelize');
const { DBHOST, DBNAME_ESIMVAULT, DBNAME_CUSTOMERS, DBPASS, DBUSER }  =  process.env;
const esimsModels = require('./models/esimModels.js');
const customersModels = require('./models/customersModels');



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

db = {esimVault, customers, Sequelize};

for (const modelInit of esimsModels) {
	const model = modelInit(db.esimVault, db.Sequelize.DataTypes);
	db[model.name] = model;
}
for (const modelInit of customersModels) {
	const model = modelInit(db.customers, db.Sequelize.DataTypes);
	db[model.name] = model;
}

for (const modelName in db) {
	db[modelName].loadScopes && db[modelName].loadScopes(db);
	db[modelName].associate && db[modelName].associate(db);
}

module.exports = db;