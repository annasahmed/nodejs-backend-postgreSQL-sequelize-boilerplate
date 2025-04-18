'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('packages');
		if (!tableDescription['status']) {
			await queryInterface.addColumn('packages', 'status', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('packages');
		if (tableDescription['status']) {
			await queryInterface.removeColumn('packages', 'status');
		}
	},
};
