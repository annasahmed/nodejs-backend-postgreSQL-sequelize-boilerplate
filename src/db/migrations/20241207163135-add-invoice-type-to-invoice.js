'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('invoice');

    if (!tableDescription['invoice_type']) {
      await queryInterface.addColumn('invoice', 'invoice_type', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '1 -> Place Packages invoice, 2 -> Place redemption Invoice'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('invoice');
    if (tableDescription['invoice_type']) {
      await queryInterface.removeColumn('invoice', 'invoice_type');
    }
  }
};
