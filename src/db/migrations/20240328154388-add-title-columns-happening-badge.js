'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription =
			await queryInterface.describeTable('parent_deal');

		if (!tableDescription['title']) {
			await queryInterface.addColumn('parent_deal', 'title', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
