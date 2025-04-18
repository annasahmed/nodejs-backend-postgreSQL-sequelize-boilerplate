'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    const vendorPlace = await queryInterface.describeTable('vendors')
    if (!vendorPlace.allow_portal_access) {
      await queryInterface.addColumn('vendors', 'allow_portal_access', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      })
    }
  },

  down: async (queryInterface, Sequelize) => {
    const vendorPlace = await queryInterface.describeTable('vendors')
    if (vendorPlace.allow_portal_access) {
      await queryInterface.removeColumn('vendors', 'allow_portal_access');
    }
  }
};
