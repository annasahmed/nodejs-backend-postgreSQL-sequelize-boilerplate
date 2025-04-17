const defaultPermissions = require('../config/permissions');

export default (sequelize, DataTypes) => {
    const permission = sequelize.define(
        'permission',
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
                unique: true,
            },
            description: {
                type: DataTypes.STRING,
            },
            parent: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'permission',
        }
    );

    permission.associate = (models) => {
        permission.belongsToMany(models.role, {
            through: 'role_to_permission',
        });
    };

    return permission;
};
