'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['trn']) {
			await queryInterface.addColumn('place', 'trn', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
