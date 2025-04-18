import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { subscriptionService } from '../services/index.js';


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

export default {
	createSubscription,
	getSubscriptions,
	getSubscription,
	updateSubscription,
	deleteSubscription,
};
