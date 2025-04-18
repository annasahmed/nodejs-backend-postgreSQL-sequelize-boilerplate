export default (sequelize, DataTypes) => {
    const token = sequelize.define(
        'token',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            cms_user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'cms_user',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'user',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            revoked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            tableName: 'token',
            timestamps: true,
        },
    );
    token.associate = (models) => {
        token.belongsTo(models.user, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        })
        token.belongsTo(models.cms_user, {
            foreignKey: 'cms_user_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        })
    };

    return token;
};
