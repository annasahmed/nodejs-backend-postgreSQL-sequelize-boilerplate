'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription = await queryInterface.describeTable('timing');

		if (!tableDescription['uploaded_from_google']) {
			await queryInterface.addColumn('timing', 'uploaded_from_google', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
