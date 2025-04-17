module.exports = {
	up: async (queryInterface, Sequelize) => {
		queryInterface.createTable('stories', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			link_type: {
				type: Sequelize.ENUM(['place', 'monthly_deal', 'external']),
				allowNull: false,
			},
			link: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			place_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			monthly_deal_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			start_date: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			end_date: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			logo: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			featured: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: [],
			},
			videos: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: [],
			},
			status: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			created_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
		});
	},
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('stories'),
};
