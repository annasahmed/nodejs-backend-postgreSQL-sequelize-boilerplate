const express = require('express');
const { reportController } = require('../../controllers');

const router = express.Router();

router.route('/app-users').get(reportController.appUsersReport);

router.route('/deal-redemption').get(reportController.dealRedemptionReport);

router.route('/special-deal').get(reportController.specialDealsReport);

router.route('/vendors').get(reportController.vendorReport);

router.route('/general').get(reportController.homepageReport);
router.route('/happenings').get(reportController.getExpiringHappenings);

module.exports = router;
