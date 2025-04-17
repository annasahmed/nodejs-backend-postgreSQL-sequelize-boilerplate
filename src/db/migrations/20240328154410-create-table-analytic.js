module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('analytic', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			event: {
				type: Sequelize.ENUM(
					'book_now_click',
					'place_click',
					'redeem_now_click',
					'place_pin_add',
					'show_code_click',
					'copy_code_click',
					'buy_now_click',
				),
				allowNull: false,
			},
			record_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			place_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			created_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
		}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('analytic'),
};
