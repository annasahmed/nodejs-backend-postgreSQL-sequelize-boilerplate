'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    // Update the 'email' and 'username' columns to remove spaces
    await queryInterface.sequelize.query(`
      UPDATE "place"
      SET "email" = REGEXP_REPLACE("email", '\\s+', '', 'g'),
          "username" = REGEXP_REPLACE("username", '\\s+', '', 'g')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // No reversal for this migration since removing spaces cannot be undone
  }
};
