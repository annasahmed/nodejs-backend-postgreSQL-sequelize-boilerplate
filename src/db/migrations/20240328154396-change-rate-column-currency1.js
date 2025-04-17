'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('currency');

		if (tableDescription['rate']) {
			await queryInterface.changeColumn('currency', 'rate', {
				type: Sequelize.DECIMAL(6, 4),
				allowNull: false,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
