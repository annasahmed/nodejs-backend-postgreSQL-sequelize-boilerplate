'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('place');

		if (!tableDescription['username']) {
			await queryInterface.addColumn('place', 'username', {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
