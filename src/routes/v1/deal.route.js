const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { dealController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(dealController.getDeals)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		dealController.addDeal,
	);
router
	.route('/:dealId')
	.delete(dealController.deleteDeal)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		dealController.updateDeal,
	);

module.exports = router;
