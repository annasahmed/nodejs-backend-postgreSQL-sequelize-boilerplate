'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('invoice_items');

    if (!tableDescription['deal_redemption_id']) {
      await queryInterface.addColumn('invoice_items', 'deal_redemption_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'deal_redemption',
          key: 'id',
        },
      });
    }
    if (tableDescription['vendor_place_id']) {
      await queryInterface.changeColumn('invoice_items', 'vendor_place_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'vendor_place',
          key: 'id',
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('invoice_items');
    if (tableDescription['deal_redemption_id']) {
      await queryInterface.removeColumn('invoice_items', 'deal_redemption_id');
    }
    if (tableDescription['vendor_place_id']) {
      await queryInterface.changeColumn('invoice_items', 'vendor_place_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vendor_place',
          key: 'id',
        },
      });
    }
  }
};
