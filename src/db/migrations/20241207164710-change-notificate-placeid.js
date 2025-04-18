'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('notifications', 'place_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('notifications', 'place_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		});
	},
};
