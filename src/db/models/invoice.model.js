export default (sequelize, DataTypes) => {
	const invoice = sequelize.define(
		'invoice',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			vendor_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'vendors',
					key: 'id',
				},
			},
			invoice_type: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
			stripe_invoice_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			total_amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			discount_amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true,
			},
			discount_reason: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'subscription_status',
					key: 'id',
				},
			},
			webhook_response: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			paid_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			payment_method: {
				type: DataTypes.ENUM('bank', 'cash', 'stripe'),
				allowNull: true,
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
			/**
			 * By default, sequelize will automatically transform all passed model names into plural
			 * References: https://sequelize.org/master/manual/model-basics.html#table-name-inference
			 */
			tableName: 'invoice',
			indexes: [
				{
					name: 'idx_status_id',
					fields: ['status_id'],
				},
				{
					name: 'idx_vendor_id',
					fields: ['vendor_id'],
				},
				{
					name: 'idx_package_id',
					fields: ['package_id'],
				},
			],
		},
	);
	invoice.associate = (models) => {
		invoice.belongsTo(models.vendors);
		invoice.belongsTo(models.packages);
		invoice.belongsTo(models.subscription_status, {
			foreignKey: 'status_id',
			as: 'status',
			onDelete: 'SET NULL',
		});
		invoice.hasMany(models.invoice_items);
	};

	return invoice;
};
