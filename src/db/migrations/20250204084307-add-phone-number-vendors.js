'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('vendors');
		if (!tableDescription['phone_number']) {
			await queryInterface.addColumn('vendors', 'phone_number', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription = await queryInterface.describeTable('vendors');
		if (tableDescription['phone_number']) {
			await queryInterface.removeColumn('vendors', 'phone_number');
		}
	},
};
