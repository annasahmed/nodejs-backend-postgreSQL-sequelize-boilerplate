export default {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('parent_deal', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			image: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			type: {
				type: Sequelize.ENUM('percentage', 'fixed'),
				allowNull: false,
			},
			discount: {
				type: Sequelize.DECIMAL(6, 3),
				allowNull: false,
			},
		}),
	down: (queryInterface /* , Sequelize */) =>
		queryInterface.dropTable('parent_deal'),
};
