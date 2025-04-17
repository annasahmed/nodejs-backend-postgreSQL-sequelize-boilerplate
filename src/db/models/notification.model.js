export default (sequelize, DataTypes) => {
  const notifications = sequelize.define(
    'notifications',
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
      description: {
        type: DataTypes.TEXT, // Corrected DataTypes.Text to DataTypes.TEXT
        allowNull: false,
        defaultValue: '',
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'place', // Assumes the name of the table is 'places'
          key: 'id',
        },
      },
      is_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_scheduled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user', // Assumes the name of the table is 'user'
          key: 'id',
        },
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
    },
    {
      tableName: 'notifications',
    },
  )

  notifications.associate = (models) => {
    notifications.belongsTo(models.place, {
      foreignKey: 'place_id',
      as: 'place',
    })
    notifications.belongsTo(models.user, {
      foreignKey: 'created_by',
      as: 'createdBy',
    })
  }

  return notifications
}
