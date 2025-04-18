'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		// Drop the existing foreign key constraint
		await queryInterface.removeConstraint(
			'subscriptions',
			'subscriptions_place_id_fkey',
		);

		// Add the foreign key constraint with the new 'CASCADE' delete behavior
		await queryInterface.addConstraint('subscriptions', {
			fields: ['place_id'],
			type: 'foreign key',
			name: 'subscriptions_place_id_fkey',
			references: {
				table: 'place',
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
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
