module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.createTable('appUser_favourite_place', {}),
		]);
		
	},
	down: (queryInterface, Sequelize) => {
		return Promise.all([queryInterface.dropTable('appUser_favourite_place')]);
	},
};
