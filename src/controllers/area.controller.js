const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminAreaService } = require('../services');

const getAreas = catchAsync(async (req, res) => {
	const areas = await adminAreaService.getAreas(req);
	res.send({ areas });
});

const addArea = catchAsync(async (req, res) => {
	const area = await adminAreaService.createArea(req);
	res.status(httpStatus.CREATED).send({ area });
});

const deleteArea = catchAsync(async (req, res) => {
	const area = await adminAreaService.deleteAreaById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateArea = catchAsync(async (req, res) => {
	const area = await adminAreaService.updateArea(req);
	res.status(httpStatus.ACCEPTED).send({ area });
});
module.exports = {
	getAreas,
	addArea,
	deleteArea,
	updateArea,
};
