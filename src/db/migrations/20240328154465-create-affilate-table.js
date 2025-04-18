'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		queryInterface.createTable('affiliate', {
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
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			}, // category title
			image: {
				type: Sequelize.STRING,
				allowNull: false,
			}, // category image
			reference_id: {
				// type: Sequelize.INTEGER,
				// allowNull: false,
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: false,
				defaultValue: [],
			},
			show: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
			color: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			status: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			created_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
			modified_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
			deleted_by: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			deleted_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
		});
	},

	down: async (queryInterface, Sequelize) => {
		// await queryInterface.removeColumn('category', 'user_id');
	},
};
