export default (sequelize, DataTypes) => {
	const role_to_permission = sequelize.define(
		'role_to_permission',
		{},
		{
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'role_to_permission',
		},
	);

	return role_to_permission;
};
