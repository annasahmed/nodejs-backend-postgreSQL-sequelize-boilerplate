'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription =
			await queryInterface.describeTable('sub_category');

		if (!tableDescription['color']) {
			await queryInterface.addColumn('sub_category', 'color', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
