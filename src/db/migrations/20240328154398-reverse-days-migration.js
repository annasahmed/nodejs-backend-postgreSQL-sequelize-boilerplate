'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable(
			'place_to_subcategory',
		);

		if (!tableDescription['days']) {
			await queryInterface.changeColumn('place_to_subcategory', 'days', {
				type: Sequelize.ARRAY(Sequelize.STRING), // Define as an array of strings
				allowNull: true,
			});
			await queryInterface.changeColumn('place_to_subcategory', 'days', {
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
