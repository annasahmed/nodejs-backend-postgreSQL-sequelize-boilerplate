'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		return queryInterface.bulkInsert('subscription_status', [
			{
				name: 'active',
				description: 'active',
			},
			{
				name: 'on hold',
				description: 'on hold',
			},
			{
				name: 'suspended',
				description: 'suspended',
			},
		]);
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
