const express = require('express');
const { analyticController } = require('../../controllers');

const router = express.Router();

router.route('/').post(analyticController.addAnalytic);
router.route('/:event').get(analyticController.getAnalytic);

export default router;
