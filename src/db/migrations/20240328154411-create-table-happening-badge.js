module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('happening_badge', {
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
		}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('happening_badge'),
};
