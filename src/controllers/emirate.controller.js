const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminEmirateService } = require('../services');

const getEmirates = catchAsync(async (req, res) => {
	const emirates = await adminEmirateService.getEmirates(req);
	res.send({ emirates });
});

const addEmirate = catchAsync(async (req, res) => {
	const emirate = await adminEmirateService.createEmirate(req);
	res.status(httpStatus.CREATED).send({ emirate });
});

const deleteEmirate = catchAsync(async (req, res) => {
	const emirate = await adminEmirateService.deleteEmirateById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateEmirate = catchAsync(async (req, res) => {
	const emirate = await adminEmirateService.updateEmirate(req);
	res.status(httpStatus.ACCEPTED).send({ emirate });
});
module.exports = {
	getEmirates,
	addEmirate,
	deleteEmirate,
	updateEmirate,
};
