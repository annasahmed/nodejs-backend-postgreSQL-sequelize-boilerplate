'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription = await queryInterface.describeTable('deal');

		if (!tableDescription['days']) {
			await queryInterface.addColumn('deal', 'days', {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: [], // Set to false if the column should not allow null values
			});
		}
		if (!tableDescription['timing']) {
			await queryInterface.addColumn('deal', 'timing', {
				type: Sequelize.ENUM(
					'morning', //7am-11:59am
					'midday', //12pm - 3:39pm
					'midafternoon', //4pm - 6:59pm
					'evening', //7pm - 12:00 am
				),
				allowNull: true, // Set to false if the column should not allow null values
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
