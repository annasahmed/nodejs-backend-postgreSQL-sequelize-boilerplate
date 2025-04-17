'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('invoice');
		if (!tableDescription['payment_method']) {
			await queryInterface.addColumn('invoice', 'payment_method', {
				type: Sequelize.ENUM('bank', 'cash', 'stripe'),
				allowNull: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('invoice');
		if (tableDescription['payment_method']) {
			await queryInterface.removeColumn('invoice', 'payment_method');
		}
	},
};
