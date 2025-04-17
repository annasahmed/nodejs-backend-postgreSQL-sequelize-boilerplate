'use strict';

const { Op, Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    // Step 1: Fetch all vendor IDs where package_id is not 2
    const trueVendorsQuery = `
      SELECT vendor_id
      FROM vendor_place
      WHERE package_id != 2
      GROUP BY vendor_id
      HAVING COUNT(*) = (
        SELECT COUNT(*)
        FROM vendor_place AS vp
        WHERE vp.vendor_id = vendor_place.vendor_id
      )
    `;

    const trueVendors = (
      await queryInterface.sequelize.query(trueVendorsQuery, {
        type: Sequelize.QueryTypes.SELECT,
      })
    ).map((v) => v.vendor_id);

    // Step 2: Remove vendors where id is not in trueVendors
    await queryInterface.bulkDelete('vendors', {
      id: {
        [Op.notIn]: trueVendors,
      },
    });

    return { message: 'Vendors Deleted Successfully' };
  },

  async down(queryInterface) {
    // Reverting this migration is not possible because the deleted data cannot be restored.
    throw new Error('This migration cannot be reverted.');
  },
};
