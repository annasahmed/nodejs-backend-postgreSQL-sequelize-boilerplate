'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		// return queryInterface.bulkInsert('status', [
		// 	{
		// 		name: 'active',
		// 		description: 'active',
		// 		created_date_time: new Date(),
		// 		modified_date_time: new Date(),
		// 	},
		// 	{
		// 		name: 'in-active',
		// 		description: 'in-active',
		// 		created_date_time: new Date(),
		// 		modified_date_time: new Date(),
		// 	},
		// ]);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
	},
};
