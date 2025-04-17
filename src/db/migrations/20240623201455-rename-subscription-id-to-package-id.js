'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Function to check if column exists in a table
		async function columnExists(tableName, columnName) {
			const tableDescription = await queryInterface.describeTable(tableName);
			return tableDescription.hasOwnProperty(columnName);
		}

		// Check and rename subscription_id to package_id in the invoice table
		if (await columnExists('invoice', 'subscription_id')) {
			await queryInterface.renameColumn('invoice', 'subscription_id', 'package_id');
		}

		// Check and rename subscription_id to package_id in the place table
		if (await columnExists('place', 'subscription_id')) {
			await queryInterface.renameColumn('place', 'subscription_id', 'package_id');
		}
	},

	down: async (queryInterface, Sequelize) => {
		async function columnExists(tableName, columnName) {
			const tableDescription = await queryInterface.describeTable(tableName);
			return tableDescription.hasOwnProperty(columnName);
		}
		// Check and revert the column rename in the invoice table
		if (await columnExists('invoice', 'package_id')) {
			await queryInterface.renameColumn('invoice', 'package_id', 'subscription_id');
		}

		// Check and revert the column rename in the place table
		if (await columnExists('place', 'package_id')) {
			await queryInterface.renameColumn('place', 'package_id', 'subscription_id');
		}
	}
};
