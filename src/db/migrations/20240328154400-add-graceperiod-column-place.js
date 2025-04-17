'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['grace_period']) {
			await queryInterface.addColumn('place', 'grace_period', {
				type: Sequelize.INTEGER,
				allowNull: true,
			});
		}
		if (!tableDescription['end_date']) {
			await queryInterface.addColumn('place', 'end_date', {
				type: Sequelize.DATE,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
