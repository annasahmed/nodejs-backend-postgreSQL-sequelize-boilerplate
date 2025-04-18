'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		return queryInterface.bulkInsert('packages', [
			{
				name: 'free',
				description: 'free',
				fee: 0,
				month: -1,
			},
			{
				name: '3 months trial',
				description: '3 months trial',
				fee: 0,
				month: 3,
			},
			{
				name: '6 months trial',
				description: '6 months trial',
				fee: 0,
				month: 6,
			},
			{
				name: 'standard',
				description: 'standard',
				fee: 1999,
				month: 12,
			},
			{
				name: 'premium',
				description: 'premium',
				fee: 4999,
				month: 12,
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
