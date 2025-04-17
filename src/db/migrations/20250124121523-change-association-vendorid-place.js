'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		// Remove the existing foreign key constraint
		await queryInterface.removeConstraint('place', 'place_vendor_id_fkey'); // Replace with your actual constraint name if different

		// Add a new foreign key constraint with ON DELETE CASCADE
		await queryInterface.addConstraint('place', {
			fields: ['vendor_id'], // The foreign key column
			type: 'foreign key',
			name: 'place_vendor_id_fkey', // Replace with your desired constraint name
			references: {
				table: 'vendors', // Referenced table
				field: 'id', // Referenced column
			},
			onDelete: 'SET NULL', // Set ON DELETE to CASCADE
			onUpdate: 'CASCADE', // Optional: Update related rows if the primary key changes
		});
	},

	async down(queryInterface, Sequelize) {
		// Remove the CASCADE constraint
		await queryInterface.removeConstraint('place', 'place_vendor_id_fkey'); // Replace with your actual constraint name if different

		// Add back the original constraint with ON DELETE SET NULL
		await queryInterface.addConstraint('place', {
			fields: ['vendor_id'],
			type: 'foreign key',
			name: 'place_vendor_id_fkey', // Replace with your desired constraint name
			references: {
				table: 'vendors',
				field: 'id',
			},
			onDelete: 'SET NULL', // Revert to ON DELETE SET NULL
			onUpdate: 'SET NULL',
		});
	},
};
