'use strict'

export default {
  up: async (queryInterface, Sequelize) => {
    const invoice = await queryInterface.describeTable('invoice')
    if (invoice.place_id) {
      await queryInterface.removeColumn('invoice', 'place_id') // Remove place_id column
    }

    if (!invoice.vendor_id) {
      await queryInterface.addColumn('invoice', 'vendor_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendors',
          key: 'id',
        },
      })
    }
  },

  down: async (queryInterface, Sequelize) => {
    const invoice = await queryInterface.describeTable('invoice')
    if (invoice.vendor_id) {
      await queryInterface.removeColumn('invoice', 'vendor_id')
    }
    if (!invoice.vendor_id) {
      await queryInterface.addColumn('invoice', 'place_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'place',
          key: 'id',
        },
      })
    }
  }
}
