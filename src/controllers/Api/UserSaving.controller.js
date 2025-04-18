import httpStatus from 'http-status'
const { userSavingService } from '../../services'
const catchAsync = require("../../utils/catchAsync");
const { DealRedemptionTransformer, UserSavingsTransformer, UserRecentRedemptionsTransformer } = require("../../transformers");

const userSavings = catchAsync(async (req, res) => {
	const userSavings = await userSavingService.getUserSaving(req);
	const savings = UserSavingsTransformer.transform(userSavings);
	res.status(httpStatus.ACCEPTED).send({ savings });
});

const userSavingRecentTransaction = catchAsync(async (req, res) => {
	const userSavings = await userSavingService.getRecentRedemptions(req);
	const transactions = UserRecentRedemptionsTransformer.transform(userSavings);
	res.status(httpStatus.ACCEPTED).send({ ...transactions });
});


export default {
	userSavings,
	userSavingRecentTransaction
};
