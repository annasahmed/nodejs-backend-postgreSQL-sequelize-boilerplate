import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const { adminCuisineService } from '../services'

const getCuisineById = catchAsync(async (req, res) => {
	const cuisine = await adminCuisineService.getCuisineById(
		req.params.cuisineId,
	);
	res.send({ cuisine });
});
const getCuisines = catchAsync(async (req, res) => {
	const cuisines = await adminCuisineService.getCuisines(req);
	res.send({ cuisines });
});

const addCuisine = catchAsync(async (req, res) => {
	const cuisine = await adminCuisineService.createCuisine(req);
	res.status(httpStatus.CREATED).send({ cuisine });
});

const deleteCuisine = catchAsync(async (req, res) => {
	const cuisine = await adminCuisineService.deleteCuisineById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateCuisine = catchAsync(async (req, res) => {
	const cuisine = await adminCuisineService.updateCuisine(req);
	res.status(httpStatus.ACCEPTED).send({ cuisine });
});
export default {
	getCuisines,
	getCuisineById,
	addCuisine,
	deleteCuisine,
	updateCuisine,
};
