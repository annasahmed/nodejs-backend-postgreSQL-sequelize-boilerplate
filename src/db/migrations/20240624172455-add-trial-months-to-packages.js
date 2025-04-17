'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDefinition = await queryInterface.describeTable('packages');

		if (!tableDefinition.trial_months) {
			await queryInterface.addColumn('packages', 'trial_months', {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {
		const tableDefinition = await queryInterface.describeTable('packages');

		if (tableDefinition.trial_months) {
			await queryInterface.removeColumn('packages', 'trial_months');
		}
	}
};
