// export default {
// 	up: (queryInterface, Sequelize) =>
// 		queryInterface.createTable('happening', {
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
// 			description: {
// 				type: Sequelize.STRING,
// 				allowNull: false,
// 			},
// 			place_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			user_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 			status_id: {
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
// 		queryInterface.dropTable('happening'),
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
