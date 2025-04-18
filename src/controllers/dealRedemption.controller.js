import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
const {
	dealRedemptionService,
	adminDealRedemptionService,
} from '../services'
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

export default {
	redeemDeal,
	deleteRedemptionsByPlaceId,
	deleteRedemptionsByPlaceIdChk,
};
