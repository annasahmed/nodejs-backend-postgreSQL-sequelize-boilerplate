'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['show_happening_badge']) {
			await queryInterface.addColumn('place', 'show_happening_badge', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
