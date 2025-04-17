'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// await queryInterface.addColumn('category', 'user_id', {
		// 	type: Sequelize.INTEGER,
		// 	allowNull: true, // Adjust as needed
		// 	// Add other column options as needed
		// });
	},

	down: async (queryInterface, Sequelize) => {
		// await queryInterface.removeColumn('category', 'user_id');
	},
};
