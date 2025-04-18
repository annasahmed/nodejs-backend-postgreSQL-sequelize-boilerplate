'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['happening_badge_id']) {
			await queryInterface.addColumn('place', 'happening_badge_id', {
				type: Sequelize.INTEGER,
				allowNull: true, // Set to false if the column should not allow null values
			});
		}
		const tableDescriptionHappening =
			await queryInterface.describeTable('happening');

		if (tableDescriptionHappening['happening_badge_id']) {
			await queryInterface.removeColumn(
				'happening',
				'happening_badge_id',
			);
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
