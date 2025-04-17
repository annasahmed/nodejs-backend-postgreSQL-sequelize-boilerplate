const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { apiAnalyticService, adminAnalyticService } = require('../services');

const addAnalytic = catchAsync(async (req, res) => {
	const analytic = await apiAnalyticService.createAnalytic(req);
	res.status(httpStatus.CREATED).send({ analytic });
});
const getAnalytic = catchAsync(async (req, res) => {
	const analytic = await adminAnalyticService.getAnalytics(req.params.event);
	res.send({ analytic });
});

module.exports = {
	addAnalytic,
	getAnalytic,
};
