const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;

async function getTrendingById(trendingId) {
	const trending = await db.trending.findOne({
		where: { id: trendingId },
	});

	return trending;
}
async function getTrendings(req) {
	const trendings = await db.trending.findAndCountAll({
		raw: true,
	});

	return trendings;
}
async function createTrending(req) {
	const Trending = [
		{
			name: true,
		},
		{
			name: false,
		},
	];
	const createdTrending = await db.trending.bulkCreate(Trending);
	// .then((resultEntity) => resultEntity.get({ plain: true }));

	return createdTrending;
}

async function createSubscription(req) {
	const subscriptions = [
		{
			name: 'free',
			description: 'free',
			fee: 0,
			month: -1,
		},
		{
			name: '3 months trial',
			description: '3 months trial',
			fee: 0,
			month: 3,
		},
		{
			name: '6 months trial',
			description: '6 months trial',
			fee: 0,
			month: 6,
		},
		{
			name: 'standard',
			description: 'standard',
			fee: 1999,
			month: 12,
		},
		{
			name: 'premium',
			description: 'premium',
			fee: 4999,
			month: 12,
		},
	];
	const createdStatus = await db.packages.bulkCreate(subscriptions);
	// .then(resultEntity);

	return createdStatus;
}
async function getSubscriptionStatuses() {
	const subscriptionStatuses = await db.subscription_status.findAndCountAll({
		raw: true,
	});

	return subscriptionStatuses;
}
async function createSubscriptionStatus(req) {
	const subscriptionsStatus = [
		{
			name: 'active',
			description: 'active',
		},
		{
			name: 'on hold',
			description: 'on hold',
		},
		{
			name: 'suspended',
			description: 'suspended',
		},
		{
			name: 'pending',
			description: 'Pending',
		},
		{
			name: 'cancelled',
			description: 'Cancelled',
		},
	];
	const createdSubscriptionsStatus =
		await db.subscription_status.bulkCreate(subscriptionsStatus);
	// .then(resultEntity);

	return createdSubscriptionsStatus;
}
async function getSubscriptionById(subscriptionId) {
	const subscription = await db.packages.findOne({
		where: { id: subscriptionId },
	});

	return subscription;
}
async function getSubscriptionStatusById(statusId) {
	// const subscription_status_id = await db.subscription_status.findOne({
	// 	where: { id: statusId },
	// });
	// return subscription_status_id;
}

async function getplaceToUsp() {
	const subscriptionStatuses = await db.place_to_usp.findAndCountAll({
		raw: true,
	});

	return subscriptionStatuses;
}
async function getplaceToSubCat() {
	const subscriptionStatuses = await db.place_to_subcategory.findAndCountAll({
		raw: true,
	});

	return subscriptionStatuses;
}
async function getuspToSubCat() {
	const subscriptionStatuses = await db.usp_to_subcategory.findAndCountAll({
		raw: true,
	});

	return subscriptionStatuses;
}
async function getplaceToCusine() {
	const subscriptionStatuses = await db.place_to_cuisine.findAndCountAll({
		raw: true,
	});

	return subscriptionStatuses;
}

module.exports = {
	getTrendings,
	getTrendingById,
	getSubscriptionById,
	getSubscriptionStatuses,
	getSubscriptionStatusById,
	createSubscription,
	createSubscriptionStatus,
	createTrending,

	getplaceToUsp,
	getplaceToSubCat,
	getplaceToCusine,
	getuspToSubCat,
};
