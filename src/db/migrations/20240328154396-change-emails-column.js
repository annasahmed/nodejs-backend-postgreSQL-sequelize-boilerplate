'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription =
			await queryInterface.describeTable('email_format');

		if (tableDescription['subject']) {
			await queryInterface.changeColumn('email_format', 'subject', {
				type: Sequelize.TEXT,
				allowNull: false,
			});
		}
		if (tableDescription['message']) {
			await queryInterface.changeColumn('email_format', 'message', {
				type: Sequelize.TEXT,
				allowNull: false,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
