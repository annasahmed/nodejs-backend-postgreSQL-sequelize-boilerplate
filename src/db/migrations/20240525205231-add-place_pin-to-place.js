'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('place', 'place_pin', {
			type: Sequelize.INTEGER,
			allowNull: true, // Set to false if you want to make this column non-nullable
		});
		await queryInterface.addIndex('place', ['place_pin'],{
			name: 'places_place_pin_unique'
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex('place', ['places_place_pin_unique'])
		await queryInterface.removeColumn('place', 'place_pin');
	}
};
