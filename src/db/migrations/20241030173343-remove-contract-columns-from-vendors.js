'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns exist before removing them
    const tableDescription = await queryInterface.describeTable('vendors');

    if (tableDescription.is_contract_signed) {
      await queryInterface.removeColumn('vendors', 'is_contract_signed');
    }

    if (tableDescription.signature) {
      await queryInterface.removeColumn('vendors', 'signature');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add columns in case of rollback
    await queryInterface.addColumn('vendors', 'is_contract_signed', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await queryInterface.addColumn('vendors', 'signature', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
