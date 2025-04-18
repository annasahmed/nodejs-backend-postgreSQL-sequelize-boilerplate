export default {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('info',
			{
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
				link: {
					type: Sequelize.TEXT,
					allowNull: false,
				}
			}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('info'),
};
