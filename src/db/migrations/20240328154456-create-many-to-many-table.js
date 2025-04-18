export default {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.createTable('monthly_deal_to_deal', {}),
			queryInterface.createTable('subcategory_to_monthlydeal', {}),
			queryInterface.createTable('place_to_deal', {}),
			queryInterface.createTable('deal_to_subcategory', {}),
		]);
	},
	down: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.dropTable('monthly_deal_to_deal'),
			queryInterface.dropTable('subcategory_to_monthlydeal'),
			queryInterface.dropTable('place_to_deal'),
			queryInterface.dropTable('deal_to_subcategory'),
		]);
	},
};
