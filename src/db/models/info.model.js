// model/info.js
import { baseAssociation, baseFields } from "./base_model";

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
			cms_user_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'cms_user',
					key: 'id',
				},
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			...baseFields,
		},
		{
			tableName: 'info',
			timestamps: true,
		}
	);

	info.associate = (models) => {
		info.belongsTo(models.cms_user, {
			foreignKey: 'cms_user_id',
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
		baseAssociation(info, models);
	};

	return info;
};
