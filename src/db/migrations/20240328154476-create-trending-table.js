// export default {
// 	up: (queryInterface, Sequelize) =>
// 		queryInterface.createTable('trending', {
// 			id: {
// 				type: Sequelize.INTEGER,
// 				allowNull: false,
// 				primaryKey: true,
// 				autoIncrement: true,
// 			},
// 			name: {
// 				type: Sequelize.BOOLEAN,
// 				allowNull: false,
// 			},
// 		}),
// 	down: (queryInterface /* , Sequelize */) =>
// 		queryInterface.dropTable('trending'),
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
