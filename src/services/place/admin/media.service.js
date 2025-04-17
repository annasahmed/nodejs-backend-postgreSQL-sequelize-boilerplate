const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service');
const { refactorCode } = require('../../../utils/globals.js');

async function createMedia(req) {
	const { logo, menu, featured, reel, placeId } = req.body;

	const createdMedia = await db.media
		.create({
			logo,
			menu,
			featured,
			reel,
			place_id: placeId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdMedia;
}

async function getMedias(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const Medias = await db.media.findAndCountAll({
		order: [
			['title', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		include: [
			// {
			// 	model: db.status,
			// 	require: true,
			// 	attributes: ['id', 'name'],
			// },
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: ['id', 'name', 'created_date_time', 'modified_date_time'],
		offset,
		limit,
		raw: true,
	});
	refactorCode(Medias, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	return Medias;
}

async function deleteMediaById(req) {
	const deletedMedia = await db.media.destroy({
		where: { id: req.params.MediaId || req.body.id },
	});

	if (!deletedMedia) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Media not found');
	}

	return deletedMedia;
}

async function updateMedia(req) {
	const { name, statusId, userId } = req.body;

	if (name) {
		const Media = await getMediaByName(name);

		if (Media) {
			throw new ApiError(httpStatus.CONFLICT, 'This Media already exits');
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedMedia = await db.media
		.update(
			{ ...req.body },
			{
				where: { id: req.params.MediaId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedMedia;
}

module.exports = {
	getMedias,
	createMedia,
	deleteMediaById,
	updateMedia,
	// getMediaById,
};
