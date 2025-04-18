'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('deal_redemption');

    if (!tableDescription['is_invoiced']) {
      await queryInterface.addColumn('deal_redemption', 'is_invoiced', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('deal_redemption');
    if (tableDescription['is_invoiced']) {
      await queryInterface.removeColumn('deal_redemption', 'is_invoiced');
    }
  }
};
