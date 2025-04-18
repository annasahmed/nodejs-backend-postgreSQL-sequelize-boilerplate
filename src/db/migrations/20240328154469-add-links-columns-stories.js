'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('stories');

		if (!tableDescription['monthly_deal_id']) {
			await queryInterface.addColumn('stories', 'monthly_deal_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			});
		}
		if (!tableDescription['link_type']) {
			await queryInterface.addColumn('stories', 'link_type', {
				type: Sequelize.ENUM(['place', 'monthly_deal', 'external']),
				allowNull: false,
			});
		}
		if (tableDescription['is_external_link']) {
			await queryInterface.removeColumn('stories', 'is_external_link');
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
