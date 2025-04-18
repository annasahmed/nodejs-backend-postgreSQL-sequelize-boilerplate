const express = require('express');
const { lockedController } = require('../../controllers');

const router = express.Router();

router.route('/').post(lockedController.addLocked);

router
	.route('/:table/:userId')
	.get(lockedController.getLockedByUserId)
	.delete(lockedController.deleteLockedByUserId);

router.route('/:table/:userId/:recordId').get(lockedController.getLocked);

export default router;
