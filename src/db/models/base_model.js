import { Op } from 'sequelize';

export const baseFields = {
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'cms_user',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};

import { Op } from 'sequelize';

export const baseScopes = () => ({
    defaultScope: {
        where: {
            deleted_at: null,
            status: true,
        },
    },
    scopes: {
        withDeleted: {}, // returns everything
        onlyDeleted: {
            where: {
                deleted_at: {
                    [Op.ne]: null,
                },
            },
        },
        notDeleted: {
            where: {
                deleted_at: null,
            },
        },
        inactive: {
            where: {
                status: false,
            },
        },

    },
});


export const baseAssociation = (modelName, models) => {
    modelName.belongsTo(models.cms_user, {
        foreignKey: 'deleted_by',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });
};

// export const addSoftDelete = (model) => {
//     model.softDelete = async function (id, deletedByUserId) {
//         return await model.update(
//             { deleted_at: new Date(), deleted_by: deletedByUserId },
//             { where: { id } }
//         );
//     };
// };
