const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const {
	adminDealService,
	imageService,
	apiDealService,
} = require('../services');

const getDeals = catchAsync(async (req, res) => {
	const clientId = await req.headers['clientid'];
	const deals =
		clientId === 'cms'
			? await adminDealService.getDealsWithoutCount(req)
			: await apiDealService.getDeals(req);
	res.send({ deals });
});

const addDeal = catchAsync(async (req, res) => {
	const deal = await adminDealService.createDeal(req);
	res.status(httpStatus.CREATED).send({ deal });
});

const deleteDeal = catchAsync(async (req, res) => {
	const deal = await adminDealService.deleteDealById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateDeal = catchAsync(async (req, res) => {
	const deal = await adminDealService.updateDeal(req);
	res.status(httpStatus.ACCEPTED).send({ deal });
});
module.exports = {
	getDeals,
	addDeal,
	deleteDeal,
	updateDeal,
};
