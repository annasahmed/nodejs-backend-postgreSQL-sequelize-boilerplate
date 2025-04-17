'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('deal');

		if (!tableDescription['days']) {
			await queryInterface.changeColumn('deal', 'days', {
				type: Sequelize.ARRAY(
					Sequelize.ENUM(
						'monday',
						'tuesday',
						'wednesday',
						'thursday',
						'friday',
						'saturday',
						'sunday',
						'daily',
					),
				), // Define as an array of strings
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
