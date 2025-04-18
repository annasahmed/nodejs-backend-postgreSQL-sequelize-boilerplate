export default {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('page',
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
				view: {
					type: Sequelize.ENUM(
						'web',
						'mobile',
						'both',
					),
					allowNull: false,
				},
				details: {
					type: Sequelize.TEXT,
					allowNull: true,
				},
				status: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
				},
			}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('page'),
};
