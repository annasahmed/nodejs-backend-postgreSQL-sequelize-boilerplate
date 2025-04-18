'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addIndex('deal_redemption', ['place_id'], {
			name: 'place_id_index'
		});
		await queryInterface.addIndex('deal_redemption', ['deal_id'], {
			name: 'deal_id_index'
		});
		await queryInterface.addIndex('deal_redemption', ['user_id'], {
			name: 'user_id_index'
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex('deal_redemption', 'place_id_index');
		await queryInterface.removeIndex('deal_redemption', 'deal_id_index');
		await queryInterface.removeIndex('deal_redemption', 'user_id_index');
	}
};
