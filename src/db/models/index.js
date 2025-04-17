/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import fs from 'fs';
import { basename as _basename } from 'path';
import Sequelize from 'sequelize';

const config = require(`${__dirname}/../../config/config`);

const basename = _basename(module.filename);

const db = {};

const sequelize = new Sequelize(
	config.sqlDB.database,
	config.sqlDB.user,
	config.sqlDB.password,
	{
		...config.sqlDB,
		logging: false,
	},
);

// fs.readdirSync(__dirname)
// 	.filter(
// 		(file) =>
// 			file.indexOf('.') !== 0 &&
// 			file !== basename &&
// 			file.slice(-9) === '.model.js',
// 	)
// 	.forEach((file) => {
// 		const model = require(path.join(__dirname, file))(
// 			sequelize,
// 			Sequelize.DataTypes,
// 		);
// 		db[model.name] = model;
// 	});

// Object.keys(db).forEach((modelName) => {
// 	if (db[modelName].associate) {
// 		db[modelName].associate(db);
// 	}
// });

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

export default db;
// module.exports = { db, sequelize, dropAllTables };
