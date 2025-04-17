'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Create the 'new_table' table
		await queryInterface.createTable('place_to_usp', {});
	},

	down: async (queryInterface, Sequelize) => {
		// Drop the 'new_table' table if the migration needs to be reverted
		// await queryInterface.dropTable('new_table');
	},
};
