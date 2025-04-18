'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		const tableDescription =
			await queryInterface.describeTable('sub_category');
		if (!tableDescription['is_website']) {
			await queryInterface.addColumn('sub_category', 'is_website', {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			});
		}
	},

	async down(queryInterface, Sequelize) {
		const tableDescription =
			await queryInterface.describeTable('sub_category');
		if (tableDescription['is_website']) {
			await queryInterface.removeColumn('sub_category', 'is_website');
		}
	},
};
