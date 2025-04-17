const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
	dealRedemptionService,
	adminDealRedemptionService,
} = require('../services');
const { DealRedemptionTransformer } = require('../transformers');

const redeemDeal = catchAsync(async (req, res) => {
	const deal = await dealRedemptionService.redeemDeal(req);
	const redemption = DealRedemptionTransformer.transform(deal);
	res.status(httpStatus.ACCEPTED).send({ redemption });
});

const deleteRedemptionsByPlaceId = catchAsync(async (req, res) => {
	const deal = await adminDealRedemptionService.deleteRedemptionsByPlaceId(
		req.params.placeId,
	);
	res.status(httpStatus.ACCEPTED).send({ deal });
});
const deleteRedemptionsByPlaceIdChk = catchAsync(async (req, res) => {
	const deal = await adminDealRedemptionService.deleteRedemptionsByPlaceIdChk(
		req.params.placeId,
	);
	res.status(httpStatus.ACCEPTED).send({ deal, chk: true });
});

module.exports = {
	redeemDeal,
	deleteRedemptionsByPlaceId,
	deleteRedemptionsByPlaceIdChk,
};
