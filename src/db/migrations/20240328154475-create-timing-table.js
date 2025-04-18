// export default {
// 	up: (queryInterface, Sequelize) =>
// 		queryInterface.createTable('timing', {
// 			id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 				primaryKey: true,
// 				autoIncrement: true,
// 			},
// 			day: {
// 				type: Sequelize.ENUM(
// 					'monday',
// 					'tuesday',
// 					'wednesday',
// 					'thursday',
// 					'friday',
// 					'saturday',
// 					'sunday',
// 				),
// 				allowNull: false,
// 			},
// 			opening: {
// 				type: Sequelize.TIME,
// 				allowNull: true,
// 			},
// 			closing: {
// 				type: Sequelize.TIME,
// 				allowNull: true,
// 			},
// 			place_id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 			},
// 		}),
// 	down: (queryInterface /* , Sequelize */) =>
// 		queryInterface.dropTable('timing'),
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
