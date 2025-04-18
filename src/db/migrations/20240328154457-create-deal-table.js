export default {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('deal', {
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
			image: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			type: {
				type: Sequelize.ENUM('percentage', 'fixed'),
				allowNull: false,
			},
			discount: {
				type: Sequelize.FLOAT,
				allowNull: false,
			},
			status: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			first_time: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			commission: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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
			modified_date_time: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				allowNull: false,
			},
		}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('home'),
};
