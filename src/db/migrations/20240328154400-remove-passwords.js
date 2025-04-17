'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['password']) {
			await queryInterface.bulkUpdate(
				'place',
				{ password: null }, // Set to null or an empty string based on your requirement
				{}, // Empty condition means it will apply to all rows
			);
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
