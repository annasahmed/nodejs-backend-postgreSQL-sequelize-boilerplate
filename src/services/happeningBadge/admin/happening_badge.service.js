import httpStatus from 'http-status'
const ApiError = require('../../../utils/ApiError.js');
const db = require('../../../db/models/index.js').default;

async function getHappeningBadgeById(id) {
	const happeningBadge = await db.happening_badge.findOne({
		where: { id },

		attributes: ['id'],
	});

	return happeningBadge;
}
async function createHappeningBadge(req) {
	const { title } = req.body;

	const createdHappeningBadge = await db.happening_badge
		.create({
			title,
		})
		.then(async (resultEntity) => {
			return resultEntity.get({ plain: true });
		});

	return createdHappeningBadge;
}

async function getHappeningBadges(req) {
	const happeningBadges = await db.happening_badge.findAndCountAll({
		order: [['id', 'ASC']],

		attributes: ['id', 'title'],
		raw: true,
	});

	return happeningBadges;
}

async function deleteHappeningBadgeById(req) {
	const id = req.params.happeningBadgeId || req.body.id;
	const deletedHappeningBadge = await db.happening_badge.destroy({
		where: { id },
	});

	if (!deletedHappeningBadge) {
		throw new ApiError(httpStatus.NOT_FOUND, 'HappeningBadge not found');
	}

	return deletedHappeningBadge;
}
async function updateHappeningBadge(req) {


	const updatedHappeningBadge = await db.happening_badge
		.update(
			{ ...req.body },
			{
				where: { id: req.params.happeningBadgeId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);
	//console.log(updatedHappeningBadge);
	return updatedHappeningBadge;
}

export default {
	getHappeningBadges,
	createHappeningBadge,
	deleteHappeningBadgeById,
	getHappeningBadgeById,
	updateHappeningBadge,
};
