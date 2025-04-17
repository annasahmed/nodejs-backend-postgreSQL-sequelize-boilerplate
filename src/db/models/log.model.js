export default (sequelize, DataTypes) => {
	const log = sequelize.define(
		'log',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			method: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			end_point: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status_code: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			message: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			ip_address: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			request_body: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			// headers: {
			// 	type: DataTypes.JSON,
			// 	allowNull: true,
			// },
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			created_date_time: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false,
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'log',
		},
	);

	log.associate = (models) => {
		log.belongsTo(models.user, {
			foreignKey: 'user_id',
			onDelete: 'CASCADE',
		});
	};

	return log;
};
