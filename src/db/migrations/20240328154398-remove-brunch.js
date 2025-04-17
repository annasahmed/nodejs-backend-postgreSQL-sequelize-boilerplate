'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove rows where sub_category_id = 1 and days contains 'daily'
    await queryInterface.sequelize.query(`
      DELETE FROM place_to_subcategory
      WHERE sub_category_id = 1 AND 'daily' = ANY(days)
    `);

    // Remove rows where sub_category_id = 1 and days is an empty array
    await queryInterface.sequelize.query(`
      DELETE FROM place_to_subcategory
      WHERE sub_category_id = 1 AND array_length(days, 1) IS NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // If you want to undo the above change, you would need to re-insert the deleted rows.
    // For simplicity, we'll leave it empty, but you can add logic here to revert the changes.
  }
};
