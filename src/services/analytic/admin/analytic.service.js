import httpStatus from 'http-status'
const ApiError = require('../../../utils/ApiError');
const db = require('../../../db/models').default;

async function getAnalytics(event, placeId) {
	if (!event) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
	}
	const whereCondition = {
		event,
	};
	if (placeId) {
		whereCondition.place_id = placeId;
	}

	const activeAppUsers = (
		await db.appUser.findAll({
			where: { status: true },
			attributes: ['id'],
			raw: true, // Return a plain object instead of a Sequelize instance
		})
	)?.map((v) => v.id);

	const analytic = await db.analytic.findAll({
		// where: { ...whereCondition },
		where: { ...whereCondition, appUser_id: activeAppUsers },
		include: [
			{
				model: db.place,
				require: false,
				attributes: ['id', 'title'],
			},
			{
				model: db.appUser,
				require: false,
				attributes: ['id', 'first_name'],
			},
			{
				model: db.deal,
				require: false,
				attributes: ['id', 'title'],
			},
		],
		attributes: ['id', 'event', 'bill'],
	});

	return analytic;
}
async function countAnalytics(event, placeId) {
	if (!event) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
	}
	const whereCondition = {
		event,
	};
	if (placeId) {
		whereCondition.place_id = placeId;
	}
	const analytic = await db.analytic.count({
		where: { ...whereCondition },
	});

	return analytic;
}

export default {
	getAnalytics,
	countAnalytics,
};
