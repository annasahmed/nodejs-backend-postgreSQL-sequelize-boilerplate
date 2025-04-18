'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('analytic');

		if (tableDescription['user_id']) {
			await queryInterface.removeConstraint(
				'analytic',
				'analytic_user_id_fkey',
			);
			await queryInterface.removeColumn('analytic', 'user_id');
		}
		if (tableDescription['record_id']) {
			await queryInterface.changeColumn('analytic', 'record_id', {
				type: Sequelize.INTEGER,
				allowNull: true, // Set to false if the column should not allow null values
			});
			await queryInterface.renameColumn(
				'analytic',
				'record_id',
				'deal_id',
			);
		}
		if (!tableDescription['appUser_id']) {
			await queryInterface.addColumn('analytic', 'appUser_id', {
				type: Sequelize.INTEGER,
				allowNull: true, // Set to false if the column should not allow null values
			});
		}


		// Add the foreign key constraint with the new 'CASCADE' delete behavior
		await queryInterface.addConstraint('analytic', {
			fields: ['appUser_id'],
			type: 'foreign key',
			name: 'analytic_appUser_id_fkey',
			references: {
				table: 'appUser',
				field: 'id',
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});
		await queryInterface.addConstraint('analytic', {
			fields: ['deal_id'],
			type: 'foreign key',
			name: 'analytic_deal_id_fkey',
			references: {
				table: 'deal',
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
