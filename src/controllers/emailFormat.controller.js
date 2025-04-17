const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminEmailFormat } = require('../services');

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
module.exports = {
	getEmailFormats,
	addEmailFormat,
	updateEmailFormats,
};
