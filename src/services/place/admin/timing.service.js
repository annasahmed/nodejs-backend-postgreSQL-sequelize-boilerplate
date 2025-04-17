const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service');

async function createTiming(req) {
	const { timingsArr } = req.body;
	if (!timingsArr) {
		return;
	}
	//console.log(timingsArr, 'timingsArr');

	const createdTiming = await db.timing.bulkCreate(timingsArr);
	// .then((resultEntity) => resultEntity.get({ plain: true }));

	return createdTiming;
}

async function getTimings(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const Timings = await db.timing.findAndCountAll({
		offset,
		limit,
		raw: true,
	});

	return Timings;
}

async function deleteTimingById(req) {
	const deletedTiming = await db.timing.destroy({
		where: { id: req.params.TimingId || req.body.id },
	});

	if (!deletedTiming) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Timing not found');
	}

	return deletedTiming;
}

async function updateTiming(req) {
	const { name, statusId, userId } = req.body;

	if (name) {
		const Timing = await getTimingByName(name);

		if (Timing) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This Timing already exits',
			);
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedTiming = await db.timing
		.update(
			{ ...req.body },
			{
				where: { id: req.params.TimingId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedTiming;
}

module.exports = {
	getTimings,
	createTiming,
	deleteTimingById,
	updateTiming,
	// getTimingById,
};
