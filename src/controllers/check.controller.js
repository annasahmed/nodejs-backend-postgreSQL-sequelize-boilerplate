import catchAsync from '../utils/catchAsync';
import {
	adminSubCategoryService,
	adminCategoryService,
	trendingService,
	happeningService,
	timingService,
	adminPlaceService,
} from '../services'
import { adminCuisineService } from '../services'
import { adminUspService } from '../services'
import { sendSingleRedemptionInvoice } from '../utils/cron';
import { sendReceipt } from '../services/Admin/stripe.service';
import {
	checkingMigration,
} from '../services/Admin/vendor/vendor.service';

const getSubscriptionsStatuses = catchAsync(async (req, res) => {
	const subscriptionStatuses =
		await trendingService.getSubscriptionStatuses(req);
	res.send({ subscriptionStatuses });
});
const getSubscriptions = catchAsync(async (req, res) => {
	const subscription = await trendingService.getSubscriptions(req);
	res.send({ subscription });
});
const getTrendings = catchAsync(async (req, res) => {
	const trending = await trendingService.getTrendings(req);
	res.send({ trending });
});
const getHappenings = catchAsync(async (req, res) => {
	const happeinings = await happeningService.getHappenings(req);
	res.send({ happeinings });
});
const getTimings = catchAsync(async (req, res) => {
	const timings = await timingService.getTimings(req);
	res.send({ timings });
});
const getTables = catchAsync(async (req, res) => {
	const getplaceToUsp = await trendingService.getplaceToUsp(req);
	const getplaceToCusine = await trendingService.getplaceToCusine(req);
	const getplaceToSubCat = await trendingService.getplaceToSubCat(req);
	const getuspToSubCat = await trendingService.getuspToSubCat(req);
	res.send({
		getplaceToUsp,
		getplaceToCusine,
		getplaceToSubCat,
		getuspToSubCat,
	});
});

const createSubscription = catchAsync(async (req, res) => {
	const subscription = await trendingService.createSubscription(req);
	res.send({ subscription });
});
const createDaysCategory = catchAsync(async (req, res) => {
	const place = await adminPlaceService.createPlaceToSubCategory(req);
	res.send({ place });
});

const createSubscriptionStatus = catchAsync(async (req, res) => {
	const trending = await trendingService.createSubscriptionStatus(req);
	res.send({ trending });
});
const createTrending = catchAsync(async (req, res) => {
	const trending = await trendingService.createTrending(req);
	res.send({ trending });
});
const sendSingleRedemptionInvoiceEmail = catchAsync(async (req, res) => {
	const data = await sendSingleRedemptionInvoice(req);
	res.send({ data });
});
const sendReceiptEmail = catchAsync(async (req, res) => {
	const data = await sendReceipt(req.params.id);
	res.send({ data });
});

export default {
	getSubscriptions,
	getTrendings,
	getHappenings,
	getTimings,
	getSubscriptionsStatuses,
	createSubscription,
	createSubscriptionStatus,
	createTrending,
	createDaysCategory,
	getTables,
	sendSingleRedemptionInvoiceEmail,
	sendReceiptEmail,

};
