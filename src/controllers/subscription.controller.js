const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { subscriptionService } = require('../services');

const createSubscription = catchAsync(async (req, res) => {
	const subscription = await subscriptionService.createSubscription(req);
	res.send({ subscription });
});

const getSubscriptions = catchAsync(async (req, res) => {
	const Subscriptions = await subscriptionService.getSubscriptions(req);
	res.send({ Subscriptions });
});

const getSubscription = catchAsync(async (req, res) => {
	// const Subscription = await subscriptionService.getSubscriptionById(req.params.SubscriptionId);
	// if (!Subscription) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
	// }
	// res.send({ Subscription });
});

const deleteSubscription = catchAsync(async (req, res) => {
	// await subscriptionService.deleteSubscriptionById(req.params.SubscriptionId);
	// res.send({ success: true });
});

const updateSubscription = catchAsync(async (req, res) => {
	const subscription = await subscriptionService.updateSubscription(req);
	res.send({ subscription });
});

module.exports = {
	createSubscription,
	getSubscriptions,
	getSubscription,
	updateSubscription,
	deleteSubscription,
};
