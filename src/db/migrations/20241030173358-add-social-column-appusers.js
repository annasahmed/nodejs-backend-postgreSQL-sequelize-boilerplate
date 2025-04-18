'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableDescription = await queryInterface.describeTable('appUser');

		if (!tableDescription['is_social']) {
			await queryInterface.addColumn('appUser', 'is_social', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
		if (tableDescription['password']) {
			await queryInterface.changeColumn('appUser', 'password', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
