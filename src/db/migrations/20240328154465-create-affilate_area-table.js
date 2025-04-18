'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		queryInterface.createTable('affiliate_area', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			provider: {
				type: Sequelize.STRING, //platinumList
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			country: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			reference_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
		});
	},

	down: async (queryInterface, Sequelize) => {
		// await queryInterface.removeColumn('category', 'user_id');
	},
};
