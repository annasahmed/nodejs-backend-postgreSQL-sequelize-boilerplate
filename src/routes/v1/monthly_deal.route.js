const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { monthlyDealController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(monthlyDealController.getMonthlyDeals)
	.post(monthlyDealController.addMonthlyDeal);
router
	.route('/:monthlyDealId')
	.get(monthlyDealController.getMonthlyDealById)
	.delete(monthlyDealController.deleteMonthlyDeal)
	.patch(monthlyDealController.updateMonthlyDeal);
router.route('/reorder').post(monthlyDealController.reorder);

export default router;
