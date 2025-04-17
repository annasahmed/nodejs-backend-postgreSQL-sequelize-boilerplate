'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['password']) {
			await queryInterface.addColumn('place', 'password', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
