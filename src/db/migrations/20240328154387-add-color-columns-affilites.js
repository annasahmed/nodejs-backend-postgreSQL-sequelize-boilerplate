'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription =
			await queryInterface.describeTable('affiliate');

		if (!tableDescription['color']) {
			await queryInterface.addColumn('affiliate', 'color', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
