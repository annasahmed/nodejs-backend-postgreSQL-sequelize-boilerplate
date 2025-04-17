// 'use strict'
// module.exports = {
// 	up: (queryInterface, Sequelize) => {
// 		// queryInterface.createTable('media', {
// 		// 	id: {
// 		// 		type: Sequelize.INTEGER,
// 		// 		allowNull: false,
// 		// 		primaryKey: true,
// 		// 		autoIncrement: true,
// 		// 	},
// 		// 	place_id: {
// 		// 		type: Sequelize.INTEGER,
// 		// 		allowNull: false,
// 		// 	},
// 		// 	logo: {
// 		// 		type: Sequelize.ARRAY(Sequelize.STRING),
// 		// 		allowNull: false,
// 		// 		defaultValue: [],
// 		// 	},
// 		// 	menu: {
// 		// 		type: Sequelize.ARRAY(Sequelize.STRING),
// 		// 		allowNull: false,
// 		// 		defaultValue: [],
// 		// 	},
// 		// 	featured: {
// 		// 		type: Sequelize.ARRAY(Sequelize.STRING),
// 		// 		allowNull: false,
// 		// 		defaultValue: [],
// 		// 	},
// 		// 	reel: {
// 		// 		type: Sequelize.ARRAY(Sequelize.STRING),
// 		// 		allowNull: false,
// 		// 		defaultValue: [],
// 		// 	},
// 		// }
// 	},
// 	down: (queryInterface /* , Sequelize */) => {
// 		// queryInterface.dropTable('media');
// 	},
// };
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
