const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { happeningBadgeController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');

const router = express.Router();

router
	.route('/')
	.get(happeningBadgeController.getHappeningBadges)
	.post(happeningBadgeController.addHappeningBadge);
router
	.route('/:happeningBadgeId')
	.patch(happeningBadgeController.updateHappeningBadge)
	.delete(happeningBadgeController.deleteHappeningBadge);

module.exports = router;
