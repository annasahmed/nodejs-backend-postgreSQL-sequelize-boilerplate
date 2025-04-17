export default (sequelize, DataTypes) => {
	const packages = sequelize.define(
		'packages',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			fee: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			month: {
				type: DataTypes.DECIMAL(18, 10),
				allowNull: false,
			},
			trial_months: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			status: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
		},
		{
			tableName: 'packages',
		},
	);

	packages.associate = (models) => {
		packages.hasMany(models.place);
	};
	return packages;
};
