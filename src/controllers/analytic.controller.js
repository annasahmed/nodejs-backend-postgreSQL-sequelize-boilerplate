import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
const { apiAnalyticService, adminAnalyticService } from '../services'

const addAnalytic = catchAsync(async (req, res) => {
	const analytic = await apiAnalyticService.createAnalytic(req);
	res.status(httpStatus.CREATED).send({ analytic });
});
const getAnalytic = catchAsync(async (req, res) => {
	const analytic = await adminAnalyticService.getAnalytics(req.params.event);
	res.send({ analytic });
});

export default {
	addAnalytic,
	getAnalytic,
};
