'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['name']) {
			await queryInterface.addColumn('place', 'name', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
