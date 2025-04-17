'use strict';

const { createPermission } = require('../../services/permission.service');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const parents = [
			'users',
			'place',
			'appuser',
			'role',
			'page',
			'notifications',
			'home',
			'filters', //subCategory, cuisine, usp, emirate ,area, neighbourhood
			'settings',
			'seasons',
			'vendors',
		];
		for (const parent of parents) {
			const req = {
				body: {
					parent,
				},
			};
			await createPermission(req,true);
		}
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
