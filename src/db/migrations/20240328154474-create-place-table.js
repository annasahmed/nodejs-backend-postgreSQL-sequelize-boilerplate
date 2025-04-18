// export default {
// 	up: (queryInterface, Sequelize) =>
// 		queryInterface.createTable('place', {
// 			id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 				primaryKey: true,
// 				autoIncrement: true,
// 			},
// 			title: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			slug: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			excerpt: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			start_date: {
// 				type: Sequelize.DATE,
// 				allowNull: false,
// 			},
// 			about: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			contact: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			website: {
// 				type: Sequelize.STRING,
// 				allowNull: true,
// 			},
// 			instagram: {
// 				type: Sequelize.STRING,
// 				allowNull: true,
// 			},
// 			booking_url: {
// 				type: Sequelize.STRING,
// 				allowNull: true,
// 			},
// 			location: {
// 				type: Sequelize.STRING,
// 				allowNull: true,
// 			},
// 			latitude: {
// 				type: Sequelize.INTEGER,
// 				allowNull: true,
// 			},
// 			longitude: {
// 				type: Sequelize.INTEGER,
// 				allowNull: true,
// 			},
// 			subscription_status_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			status_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			trending_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			email: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			deal: {
// 				type: Sequelize.STRING,
// 				allowNull: true,
// 			},
// 			user_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			package_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			subscription_status_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			created_date_time: {
// 				type: Sequelize.DATE,
// 				defaultValue: Sequelize.NOW,
// 				allowNull: false,
// 			},
// 			modified_date_time: {
// 				type: Sequelize.DATE,
// 				defaultValue: Sequelize.NOW,
// 				allowNull: false,
// 			},
// 		}),
// 	down: (queryInterface /* , Sequelize */) =>
// 		queryInterface.dropTable('place'),
// };
'use strict';

export default {
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
