'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vendorPlace = await queryInterface.describeTable('vendor_place')
    if (!vendorPlace.status) {
      await queryInterface.addColumn('vendor_place', 'status', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Default value is true
      })
    }
  },

  down: async (queryInterface, Sequelize) => {
    const vendorPlace = await queryInterface.describeTable('vendor_place')
    if (vendorPlace.status){
      await queryInterface.removeColumn('vendor_place', 'status');
    }
  }
};
