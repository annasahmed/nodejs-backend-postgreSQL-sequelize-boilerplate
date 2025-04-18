import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const {
	adminMonthlyDealService,
	apiMonthlyDealService,
} from '../services'

const getMonthlyDealById = catchAsync(async (req, res) => {
	const monthlyDeal = await adminMonthlyDealService.getMonthlyDealById(
		req.params.monthlyDealId,
	);
	res.send({ monthlyDeal });
});
const getMonthlyDeals = catchAsync(async (req, res) => {
	const clientId = req.headers['clientid'] === 'cms';
	const monthlyDeals = clientId
		? await adminMonthlyDealService.getMonthlyDealsWithoutCount(req)
		: await apiMonthlyDealService.getMonthlyDealsWithoutCount(req);
	res.send({ monthlyDeals });
});

const reorder = catchAsync(async (req, res) => {
	await adminMonthlyDealService.reorder(req);
	res.status(httpStatus.ACCEPTED).send({
		message: 'Order Updted Sucessfully',
	});
});
const addMonthlyDeal = catchAsync(async (req, res) => {
	const monthlyDeal = await adminMonthlyDealService.createMonthlyDeal(req);
	res.status(httpStatus.CREATED).send({ monthlyDeal });
});

const deleteMonthlyDeal = catchAsync(async (req, res) => {
	const monthlyDeal =
		await adminMonthlyDealService.deleteMonthlyDealById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateMonthlyDeal = catchAsync(async (req, res) => {
	const monthlyDeal = await adminMonthlyDealService.updateMonthlyDeal(req);
	res.status(httpStatus.ACCEPTED).send({ monthlyDeal });
});
export default {
	getMonthlyDeals,
	addMonthlyDeal,
	deleteMonthlyDeal,
	updateMonthlyDeal,
	getMonthlyDealById,
	reorder,
};
