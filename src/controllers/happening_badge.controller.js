const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminHappeningBadgeService } = require('../services');

const getHappeningBadges = catchAsync(async (req, res) => {
	const happeningBadges =
		await adminHappeningBadgeService.getHappeningBadges(req);
	res.send({ happeningBadges });
});

const addHappeningBadge = catchAsync(async (req, res) => {
	const happeningBadge =
		await adminHappeningBadgeService.createHappeningBadge(req);
	res.status(httpStatus.CREATED).send({ happeningBadge });
});
const updateHappeningBadge = catchAsync(async (req, res) => {
	const happeningBadge =
		await adminHappeningBadgeService.updateHappeningBadge(req);
	res.status(httpStatus.CREATED).send({ happeningBadge });
});

const deleteHappeningBadge = catchAsync(async (req, res) => {
	const HappeningBadge =
		await adminHappeningBadgeService.deleteHappeningBadgeById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});

module.exports = {
	getHappeningBadges,
	addHappeningBadge,
	deleteHappeningBadge,
	updateHappeningBadge,
};
