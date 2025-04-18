'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription = await queryInterface.describeTable('deal_redemption');

		if (!tableDescription['barcode_path']) {
			await queryInterface.addColumn('deal_redemption', 'barcode_path', {
				type: Sequelize.STRING,
				allowNull: true, // Set to false if the column should not allow null values
			});
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the column if it exists
		const tableDescription = await queryInterface.describeTable('deal_redemption');

		if (tableDescription['barcode_path']) {
			await queryInterface.removeColumn('deal_redemption', 'barcode_path');
		}
	}
};
