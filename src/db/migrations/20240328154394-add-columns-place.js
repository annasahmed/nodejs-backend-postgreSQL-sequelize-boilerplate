'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['temp_status']) {
			await queryInterface.addColumn('place', 'temp_status', {
				type: Sequelize.ENUM('coming_soon', 'closed'),
				allowNull: true,
			});
		}
		if (!tableDescription['welcome_email_sent']) {
			await queryInterface.addColumn('place', 'welcome_email_sent', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
