import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const { adminNeighbourhoodService } from '../services'

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
export default {
	getNeighbourhoods,
	addNeighbourhood,
	deleteNeighbourhood,
	updateNeighbourhood,
};
