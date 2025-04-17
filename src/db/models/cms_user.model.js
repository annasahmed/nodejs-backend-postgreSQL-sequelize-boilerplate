export default (sequelize, DataTypes) => {
	const cms_user = sequelize.define(
		'cms_user',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			first_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			last_name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			image: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue:true,
				allowNull: false,
			},
			role_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			isLogged: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			}
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'cms_user',
			timestamps: true, 
		},
	);

	cms_user.associate = (models) => {
		cms_user.belongsTo(models.role);
		cms_user.hasMany(models.sub_category);
		cms_user.hasMany(models.cuisine);
	};

	return cms_user;
};
