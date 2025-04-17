'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('packages', 'fee', {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		// await queryInterface.removeColumn('category', 'user_id');
	},
};
