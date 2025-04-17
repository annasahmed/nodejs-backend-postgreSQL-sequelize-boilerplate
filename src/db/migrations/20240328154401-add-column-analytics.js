'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('analytic');

		if (!tableDescription['app_user_id']) {
			await queryInterface.addColumn('analytic', 'app_user_id', {
				type: Sequelize.INTEGER,
				allowNull: true, // Set to false if the column should not allow null values
			});
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Drop the existing foreign key constraint
		// await queryInterface.removeConstraint('invoices', 'invoices_place_id_fkey');
		// // Revert to the previous foreign key constraint with the 'SET NULL' delete behavior
		// await queryInterface.addConstraint('invoices', {
		//   fields: ['place_id'],
		//   type: 'foreign key',
		//   name: 'invoices_place_id_fkey',
		//   references: {
		//     table: 'places',
		//     field: 'id',
		//   },
		//   onDelete: 'SET NULL',
		//   onUpdate: 'CASCADE',
		// });
	},
};
