const express = require('express');
const { websitePlaceController } = require('../../../controllers/Website');

const router = express.Router();

router.route('/').get(websitePlaceController.getPlaces);
router.route('/category/:id').get(websitePlaceController.getPlacesByCategory);
router.route('/banner').get(websitePlaceController.getPlacesBanner);

module.exports = router;
