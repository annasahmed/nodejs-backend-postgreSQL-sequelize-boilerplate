const catchAsync = require('../utils/catchAsync');
const {
	adminSubCategoryService,
	adminCategoryService,
	trendingService,
	roleService,
	adminEmirateService,
	adminPlaceService,
	adminDealService,
	adminAreaService,
	adminParentDealService,
	adminHappeningBadgeService,
	apiPlaceService,
	apiInfoService,
	apiCategoryService,
	apiCuisineService,
	apiUspService,
	apiEmirateService,
	apiCurrencyService,
	permissionService,
	apiAreaService,
	adminappUserService,
	apiPlatinumListService,
	adminPlatinumListService,
	adminVendorService,
	subscriptionService,
} = require('../services');
const { adminCuisineService } = require('../services');
const { adminUspService } = require('../services');
const {
	getAdminAffiliateCategories,
} = require('./affiliates/platinumList.controler');

const getMetadata = catchAsync(async (req, res) => {
	req.query.limit = 100000;
	const categories = await apiCategoryService.getCategories(req);
	const areas = await apiAreaService.getAreas(req);
	const currencies = await apiCurrencyService.getCurrencies(req);
	// const platinumlistCategories =
	// 	await apiPlatinumListService.getAffiliateCategories(req);
	const awsBucketUrl = 'cdn.dubaidailydeals.app';
	const info = await apiInfoService.getInfos(req);
	res.send({
		categories,
		areas,
		awsBucketUrl,
		info,
		currencies,
		// platinumlistCategories,
	});
});
const getMetadataDashboard = catchAsync(async (req, res) => {
	req.query.limit = 100000;
	const placesCount = await adminPlaceService.getPlacesCount(req);
	const vendorsCount = await adminPlaceService.getVendorsCount(req);
	const places = await adminPlaceService.getPlacesCountByPackage(req);
	const appUsersCount = await adminappUserService.getAppusersCount(req);
	const appUsers = await adminappUserService.getAppusersByMonth(req);

	res.send({
		placesCount,
		vendorsCount,
		places,
		appUsersCount,
		appUsers,
	});
});
const getMetadataCms = catchAsync(async (req, res) => {
	req.query.limit = 100000;
	const categories = await adminCategoryService.getCategories(req);
	const subCategories = await adminSubCategoryService.getSubCategories(
		req,
		'cms',
	);
	const roles = await roleService.getRoles(req);
	const cuisines = await adminCuisineService.getCuisines(req, 'cms');
	const usps = await adminUspService.getUsps(req, 'cms');
	const emirates = await adminEmirateService.getEmirates(req, 'cms');
	const countries = await adminEmirateService.getCountries(req, 'cms');

	const areas = await adminAreaService.getAreas(req, 'cms');
	const trendings = await trendingService.getTrendings(req);
	const packages = await subscriptionService.getMetaSubscription(req);
	const places = await adminPlaceService.getPlacesNames(req, 'cms');
	const deals = await adminDealService.getDealsTitle(req, 'cms');
	const parentDeals = await adminParentDealService.getParentDeals(req, 'cms');
	const permissions = await permissionService.getPermissionGroupByParent(
		req,
		'cms',
	);
	const happeningBadges =
		await adminHappeningBadgeService.getHappeningBadges(req);
	const subscriptionStatuses =
		await trendingService.getSubscriptionStatuses(req);

	const currencyCountries = [
		'AFN',
		'ALL',
		'AMD',
		'ANG',
		'AOA',
		'ARS',
		'AUD',
		'AWG',
		'AZN',
		'BAM',
		'BBD',
		'BDT',
		'BGN',
		'BHD',
		'BIF',
		'BMD',
		'BND',
		'BOB',
		'BRL',
		'BSD',
		'BTN',
		'BWP',
		'BYN',
		'BZD',
		'CAD',
		'CDF',
		'CHF',
		'CLP',
		'CNY',
		'COP',
		'CRC',
		'CUP',
		'CVE',
		'CZK',
		'DJF',
		'DKK',
		'DOP',
		'DZD',
		'EGP',
		'ERN',
		'ETB',
		'EUR',
		'FJD',
		'FKP',
		'FOK',
		'GBP',
		'GEL',
		'GGP',
		'GHS',
		'GIP',
		'GMD',
		'GNF',
		'GTQ',
		'GYD',
		'HKD',
		'HNL',
		'HRK',
		'HTG',
		'HUF',
		'IDR',
		'ILS',
		'IMP',
		'INR',
		'IQD',
		'IRR',
		'ISK',
		'JEP',
		'JMD',
		'JOD',
		'JPY',
		'KES',
		'KGS',
		'KHR',
		'KID',
		'KMF',
		'KRW',
		'KWD',
		'KYD',
		'KZT',
		'LAK',
		'LBP',
		'LKR',
		'LRD',
		'LSL',
		'LYD',
		'MAD',
		'MDL',
		'MGA',
		'MKD',
		'MMK',
		'MNT',
		'MOP',
		'MRU',
		'MUR',
		'MVR',
		'MWK',
		'MXN',
		'MYR',
		'MZN',
		'NAD',
		'NGN',
		'NIO',
		'NOK',
		'NPR',
		'NZD',
		'OMR',
		'PAB',
		'PEN',
		'PGK',
		'PHP',
		'PKR',
		'PLN',
		'PYG',
		'QAR',
		'RON',
		'RSD',
		'RUB',
		'RWF',
		'SAR',
		'SBD',
		'SCR',
		'SDG',
		'SEK',
		'SGD',
		'SHP',
		'SLE',
		'SLL',
		'SOS',
		'SRD',
		'SSP',
		'STN',
		'SYP',
		'SZL',
		'THB',
		'TJS',
		'TMT',
		'TND',
		'TOP',
		'TRY',
		'TTD',
		'TVD',
		'TWD',
		'TZS',
		'UAH',
		'UGX',
		'USD',
		'UYU',
		'UZS',
		'VES',
		'VND',
		'VUV',
		'WST',
		'XAF',
		'XCD',
		'XDR',
		'XOF',
		'XPF',
		'YER',
		'ZAR',
		'ZMW',
		'ZWL',
	];
	const placesCount = await adminPlaceService.getPlacesCount(req);
	const affiliateCategories =
		await adminPlatinumListService.getAffiliateCategoriesMeta();
	res.send({
		categories,
		subCategories,
		cuisines,
		usps,
		emirates,
		countries,
		areas,
		roles,
		trendings,
		packages,
		subscriptionStatuses,
		places,
		deals,
		parentDeals,
		happeningBadges,
		permissions,
		currencyCountries,
		placesCount,
		affiliateCategories,
	});
});

const getInvoicesReportDashboard = catchAsync(async (req, res) => {
	const invoicesReport = await adminVendorService.vendorInvoicesReport(req);
	res.send({
		invoicesReport,
	});
});

module.exports = {
	getMetadata,
	getMetadataCms,
	getMetadataDashboard,
	getInvoicesReportDashboard,
};
