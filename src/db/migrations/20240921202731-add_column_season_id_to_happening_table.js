'use strict'

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('happening')

    if (!tableDefinition.season_id) {
      await queryInterface.addColumn('happening', 'season_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'seasons',
          key: 'id',
        },
      })
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('happening');

    if (tableDefinition.trial_months) {
      await queryInterface.removeColumn('happening', 'season_id');
    }
  }
}
