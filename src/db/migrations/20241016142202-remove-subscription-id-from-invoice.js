'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const invoice = await queryInterface.describeTable('invoice')
    if (invoice.subscription_id) {
      await queryInterface.removeColumn('invoice', 'subscription_id');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const invoice = await queryInterface.describeTable('invoice')
    if (!invoice.subscription_id){
      await queryInterface.addColumn('invoice', 'subscription_id', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      })
    }
  }
};
