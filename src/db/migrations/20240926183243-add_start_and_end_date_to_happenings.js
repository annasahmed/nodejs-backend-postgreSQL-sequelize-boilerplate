'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // Check if the columns already exist before adding them
    const table = await queryInterface.describeTable('happening');

    if (!table.start_date) {
      await queryInterface.addColumn('happening', 'start_date', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!table.end_date) {
      await queryInterface.addColumn('happening', 'end_date', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('happening');

    if (table.start_date) {
      await queryInterface.removeColumn('happening', 'start_date');
    }

    if (table.end_date) {
      await queryInterface.removeColumn('happening', 'end_date');
    }
  }
};
