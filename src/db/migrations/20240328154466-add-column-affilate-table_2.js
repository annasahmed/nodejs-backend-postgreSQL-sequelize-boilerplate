'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription =
			await queryInterface.describeTable('affiliate');

		if (!tableDescription['show']) {
			await queryInterface.addColumn('affiliate', 'show', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
		if (tableDescription['user_id']) {
			await queryInterface.changeColumn('affiliate', 'user_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			});
		}
		if (tableDescription['image']) {
			await queryInterface.changeColumn('affiliate', 'image', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		if (tableDescription['show']) {
			await queryInterface.changeColumn('affiliate', 'show', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {
		// await queryInterface.removeColumn('category', 'user_id');
	},
};
