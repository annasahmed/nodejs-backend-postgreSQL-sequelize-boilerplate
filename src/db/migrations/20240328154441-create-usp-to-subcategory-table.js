export default {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.createTable('usp_to_subcategory', {}),
		]);
	},
	down: (queryInterface, Sequelize) => {
		return Promise.all([queryInterface.dropTable('usp_to_subcategory')]);
	},
};
