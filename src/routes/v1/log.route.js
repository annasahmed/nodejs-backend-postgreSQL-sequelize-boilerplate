const express = require('express');
const { logController } = require('../../controllers');

const router = express.Router();

router.route('/').get(logController.getLogs);

export default router;
