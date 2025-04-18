'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex('place', 'place_place_pin_key');
		await queryInterface.removeIndex('place', 'places_place_pin_unique');
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addIndex('place', {
			fields: ['place_pin'],
			type: 'unique',
			name: 'place_place_pin_key'
		});
	}
};
