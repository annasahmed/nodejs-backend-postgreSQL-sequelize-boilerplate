import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const { adminEmailFormat } from '../services'

const getCuisineById = catchAsync(async (req, res) => {
	const cuisine = await adminEmailFormat.getCuisineById(req.params.cuisineId);
	res.send({ cuisine });
});
const getEmailFormats = catchAsync(async (req, res) => {
	const emailFormats = await adminEmailFormat.getEmailFormats(req);
	res.send({ emailFormats });
});

const addEmailFormat = catchAsync(async (req, res) => {
	const emailFormats = await adminEmailFormat.createEmailFormat(req);
	res.status(httpStatus.CREATED).send({ emailFormats });
});

const deleteCuisine = catchAsync(async (req, res) => {
	const cuisine = await adminEmailFormat.deleteCuisineById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateEmailFormats = catchAsync(async (req, res) => {
	const emailFormats = await adminEmailFormat.updateEmailFormats(req);
	res.status(httpStatus.ACCEPTED).send({ emailFormats });
});
export default {
	getEmailFormats,
	addEmailFormat,
	updateEmailFormats,
};
