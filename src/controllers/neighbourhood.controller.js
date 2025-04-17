const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminNeighbourhoodService } = require('../services');

const getNeighbourhoods = catchAsync(async (req, res) => {
	const neighbourhoods = await adminNeighbourhoodService.getNeighbourhoods(req);
	res.send({ neighbourhoods });
});

const addNeighbourhood = catchAsync(async (req, res) => {
	const neighbourhood = await adminNeighbourhoodService.createNeighbourhood(req);
	res.status(httpStatus.CREATED).send({ neighbourhood });
});

const deleteNeighbourhood = catchAsync(async (req, res) => {
	const neighbourhood = await adminNeighbourhoodService.deleteNeighbourhoodById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateNeighbourhood = catchAsync(async (req, res) => {
	const neighbourhood = await adminNeighbourhoodService.updateNeighbourhood(req);
	res.status(httpStatus.ACCEPTED).send({ neighbourhood });
});
module.exports = {
	getNeighbourhoods,
	addNeighbourhood,
	deleteNeighbourhood,
	updateNeighbourhood,
};
