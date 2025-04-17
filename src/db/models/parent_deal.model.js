export default (sequelize, DataTypes) => {
	const parent_deal = sequelize.define(
		'parent_deal',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			image: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			type: {
				type: DataTypes.ENUM('percentage', 'fixed'),
				allowNull: false,
			},
			discount: {
				type: DataTypes.DECIMAL(6, 3),
				allowNull: false,
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'parent_deal',
		},
	);

	parent_deal.associate = (models) => {
		parent_deal.hasMany(models.deal);
	};

	return parent_deal;
};
