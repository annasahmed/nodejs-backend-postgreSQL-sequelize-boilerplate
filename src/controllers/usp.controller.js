const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminUspService, apiUspService } = require('../services');

const getUsps = catchAsync(async (req, res) => {
	const clientIdCms = req.headers['clientid'] === 'cms';
	const usps = clientIdCms
		? await adminUspService.getUsps(req)
		: await apiUspService.getUsps(req);
	res.send({ usps });
});

const addUsp = catchAsync(async (req, res) => {
	const usp = await adminUspService.createUsp(req);
	res.status(httpStatus.CREATED).send({ usp });
});

const deleteUsp = catchAsync(async (req, res) => {
	const usp = await adminUspService.deleteUspById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateUsp = catchAsync(async (req, res) => {
	const usp = await adminUspService.updateUsp(req);
	res.status(httpStatus.ACCEPTED).send({ usp });
});
module.exports = {
	getUsps,
	addUsp,
	deleteUsp,
	updateUsp,
};
