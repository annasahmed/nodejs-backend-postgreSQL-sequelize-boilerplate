module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.createTable('place_to_monthly_deal', {}),
		]);
	},
	down: (queryInterface, Sequelize) => {
		return Promise.all([queryInterface.dropTable('place_to_monthly_deal')]);
	},
};
