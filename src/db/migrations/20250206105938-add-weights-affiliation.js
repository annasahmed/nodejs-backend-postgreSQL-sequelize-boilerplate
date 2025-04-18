'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		const tableDescription =
			await queryInterface.describeTable('affiliate');
		if (!tableDescription['weight']) {
			await queryInterface.addColumn('affiliate', 'weight', {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription =
			await queryInterface.describeTable('affiliate');
		if (tableDescription['weight']) {
			await queryInterface.removeColumn('affiliate', 'weight');
		}
	},
};
