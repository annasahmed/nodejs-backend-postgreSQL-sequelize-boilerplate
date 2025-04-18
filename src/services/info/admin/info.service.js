import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const { refactorCode } = require('../../../utils/globals.js');

async function getInfoByTitle(title) {
	const info = await db.info.findOne({
		where: { title },
		attributes: [
			'id'
		],
	});
	return info;
}

async function createInfo(req) {
	const { title, link } = req.body;
	const info = await getInfoByTitle(title);

	if (info) {
		throw new ApiError(httpStatus.CONFLICT, 'This Info already exits');
	}

	const createdInfo = await db.info
		.create({
			title,
			link
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdInfo;
}

async function getInfos(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const infos = await db.info.findAll({
		order: [
			['id', 'ASC']
		],
		attributes: [
			'id',
			'title',
			'link'
		],
		offset,
		limit,
		raw: true,
	});
	return infos;
}

async function deleteInfoById(req) {
	const deletedInfo = await db.info.destroy({
		where: { id: req.params.infoId || req.body.id },
	});

	if (!deletedInfo) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Info not found');
	}

	return deletedInfo;
}

async function updateInfo(req) {
	const { title } = req.body;
	if (title) {
		const info = await getInfoByTitle(title);

		if (info) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This Info already exits',
			);
		}
	}

	const updatedInfo = await db.info
		.update(
			{ ...req.body },
			{
				where: { id: req.params.infoId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedInfo;
}

export default {
	getInfos,
	createInfo,
	deleteInfoById,
	updateInfo,
};
