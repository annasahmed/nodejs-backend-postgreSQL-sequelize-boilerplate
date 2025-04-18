'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('vendors');
		if (!tableDescription['is_logged']) {
			await queryInterface.addColumn('vendors', 'is_logged', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
		if (!tableDescription['is_email_sent']) {
			await queryInterface.addColumn('vendors', 'is_email_sent', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('vendors');
		if (tableDescription['is_logged']) {
			await queryInterface.removeColumn('vendors', 'is_logged');
		}
		if (tableDescription['is_email_sent']) {
			await queryInterface.removeColumn('vendors', 'is_email_sent');
		}
	},
};
