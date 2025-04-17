'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableName = 'subscription';
		const newTableName = 'packages';

		const tableExist = await queryInterface.sequelize.query(
			`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '${tableName}'`,
			{ type: queryInterface.sequelize.QueryTypes.SELECT }
		);

		if (tableExist[0].count > 0) {
			await queryInterface.renameTable(tableName, newTableName);
		}
	},

	down: async (queryInterface, Sequelize) => {
		const tableName = 'packages';
		const oldTableName = 'subscription';

		const tableExist = await queryInterface.sequelize.query(
			`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '${tableName}'`,
			{ type: queryInterface.sequelize.QueryTypes.SELECT }
		);

		if (tableExist[0].count > 0) {
			await queryInterface.renameTable(tableName, oldTableName);
		}
	}
};
