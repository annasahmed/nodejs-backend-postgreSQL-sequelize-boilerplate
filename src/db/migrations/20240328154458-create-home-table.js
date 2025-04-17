module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('home', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			image: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			link: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			type: {
				type: Sequelize.ENUM('slider', 'banner'),
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
			status: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			created_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
			modified_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
		}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('home'),
};
