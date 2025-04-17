'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription =
			await queryInterface.describeTable('monthly_deal');

		if (!tableDescription['weight']) {
			await queryInterface.addColumn('monthly_deal', 'weight', {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
