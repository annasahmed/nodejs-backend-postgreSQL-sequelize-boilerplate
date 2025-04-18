export default (sequelize, DataTypes) => {
	const user = sequelize.define(
		'user',
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
			image: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			is_social: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			instagram_id: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			phone_number: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			gender: {
				type: DataTypes.ENUM('male', 'female'),
				allowNull: true,
			},
			date_of_birth: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			isLogged: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			status: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			created_date_time: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false,
			},
			modified_date_time: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'user',
		},
	);
	user.associate = (models) => {
		user.belongsToMany(models.place, {
			through: 'user_favourite_place',
		});
		user.hasMany(models.deal_redemption, {
			foreignKey: 'user_id',
		});
	};

	return user;
};
