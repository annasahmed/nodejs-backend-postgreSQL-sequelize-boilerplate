'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['is_ecommerce']) {
			await queryInterface.addColumn('place', 'is_ecommerce', {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			});
		}

		if (!tableDescription['ecommerce_code']) {
			await queryInterface.addColumn('place', 'ecommerce_code', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		if (!tableDescription['ecommerce_affiliation']) {
			await queryInterface.addColumn('place', 'ecommerce_affiliation', {
				type: Sequelize.TEXT,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
