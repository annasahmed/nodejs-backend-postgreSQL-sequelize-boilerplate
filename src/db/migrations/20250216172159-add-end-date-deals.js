'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('deal');
		if (!tableDescription['end_date']) {
			await queryInterface.addColumn('deal', 'end_date', {
				type: Sequelize.DATE,
				allowNull: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('deal');
		if (tableDescription['end_date']) {
			await queryInterface.removeColumn('deal', 'end_date');
		}
	},
};
