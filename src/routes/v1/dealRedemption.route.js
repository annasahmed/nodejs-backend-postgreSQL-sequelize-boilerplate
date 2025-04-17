const express = require('express');
const { dealRedemptionController } = require('../../controllers');
const {
	validateDealRedeem,
} = require('../../validations/dealRedemption.validation');

const router = express.Router();

router
	.route('/redeem')
	.post(validateDealRedeem, dealRedemptionController.redeemDeal);
router
	.route('/delete/:placeId')
	.delete(dealRedemptionController.deleteRedemptionsByPlaceId);
router
	.route('/delete/chk/:placeId')
	.delete(dealRedemptionController.deleteRedemptionsByPlaceIdChk);

module.exports = router;
