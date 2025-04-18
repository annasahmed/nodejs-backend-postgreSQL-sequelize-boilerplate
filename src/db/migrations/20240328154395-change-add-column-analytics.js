'use strict';

export default {
	up: async (queryInterface, Sequelize) => {
		const tableDescription = await queryInterface.describeTable('analytic');

		if (tableDescription['event']) {
			await queryInterface.changeColumn('analytic', 'event', {
				type: Sequelize.ENUM(
					'book_now_click',
					'place_click',
					'redeem_now_click',
					'place_pin_add',
					'show_code_click',
					'copy_code_click',
					'buy_now_click',

					// functionalities
					'search_place', // search keyword
					'filter_place_icon',
					'filter_place_button',
					'categories_all',
					'category_item', //sub_category_id
					'nearby_places_all',
					'nearby_place_item', //place_id
					'specialdeals_all', // monthly_deal_id
					'specialdeal_item', // monthly_deal_id place_id

					// mobile app bottom navigation bar
					'map_icon',
					'favourites_icon',
					'notification_icon',
					'profile_icon',
				),
				allowNull: false,
			});
		}
		if (tableDescription['place_id']) {
			await queryInterface.changeColumn('analytic', 'place_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			});
		}
		if (!tableDescription['description']) {
			await queryInterface.addColumn('analytic', 'description', {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
		if (!tableDescription['sub_category_id']) {
			await queryInterface.addColumn('analytic', 'sub_category_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			});
		}
		if (!tableDescription['monthly_deal_id']) {
			await queryInterface.addColumn('analytic', 'monthly_deal_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => { },
};
