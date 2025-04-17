'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const models = [
			'usp',
			'sub_category',
			'cuisine',
			'area',
			'emirate',
			'neighbourhood',
			'place',
		];
		for (const model of models) {
			const tableDescription = await queryInterface.describeTable(model);

			if (!tableDescription['deleted_by']) {
				await queryInterface.addColumn(model, 'deleted_by', {
					type: Sequelize.INTEGER,
					allowNull: true,
				});
			}
			if (!tableDescription['deleted_at']) {
				await queryInterface.addColumn(model, 'deleted_at', {
					type: Sequelize.DATE,
					allowNull: true,
				});
			}
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
