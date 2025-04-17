export default (sequelize, DataTypes) => {
	const info = sequelize.define(
		'info',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			link: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'info',
		},
	);

	return info;
};
