'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// return queryInterface.bulkInsert('role', [
		// 	// {
		// 	// 	name: 'admin',
		// 	// 	description: 'admin',
		// 	// 	created_date_time: new Date(),
		// 	// 	modified_date_time: new Date(),
		// 	// },
		// 	// {
		// 	// 	name: 'user',
		// 	// 	description: 'user',
		// 	// 	created_date_time: new Date(),
		// 	// 	modified_date_time: new Date(),
		// 	// },
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
