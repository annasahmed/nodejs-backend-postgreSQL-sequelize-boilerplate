'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const tableDescription =
			await queryInterface.describeTable('affiliate');

		if (tableDescription['reference_id']) {
			await queryInterface.addColumn('affiliate', 'reference_id_temp', {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: false,
				defaultValue: [],
			});
			await queryInterface.sequelize.query(`
				UPDATE "affiliate"
				SET "reference_id_temp" = ARRAY["reference_id"]
			  `);
			await queryInterface.removeColumn('affiliate', 'reference_id');
			await queryInterface.renameColumn(
				'affiliate',
				'reference_id_temp',
				'reference_id',
			);
			// await queryInterface.changeColumn('affiliate', 'reference_id', {
			// 	type: Sequelize.ARRAY(Sequelize.INTEGER),
			// 	allowNull: false,
			// 	defaultValue: [],
			// });
		}
	},

	down: async (queryInterface, Sequelize) => {},
};
