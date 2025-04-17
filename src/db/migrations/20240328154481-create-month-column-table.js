'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('packages', 'month', {
			type: Sequelize.FLOAT,
			allowNull: false,
		});
	},

	down: async (queryInterface, Sequelize) => {
		// await queryInterface.removeColumn('category', 'user_id');
	},
};
