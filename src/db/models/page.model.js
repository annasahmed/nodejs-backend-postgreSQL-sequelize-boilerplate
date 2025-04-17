export default (sequelize, DataTypes) => {
	const page = sequelize.define(
		'page',
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
			slug: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			view: {
				type: DataTypes.ENUM(
					'web',
					'mobile',
					'both',
				),
				allowNull: false,
			},
			details: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			status: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'page',
		},
	);


	return page;
};
