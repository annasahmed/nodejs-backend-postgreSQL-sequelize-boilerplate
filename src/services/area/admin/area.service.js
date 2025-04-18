import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service.js');
const { adminEmirateService } = require('../../index.js');
const { refactorCode } = require('../../../utils/globals.js');

async function getAreaByName(name) {
	const area = await db.area.findOne({
		where: { name },
	});

	return area;
}
async function getAreaById(id) {
	const area = await db.area.findOne({
		where: { id },
		raw: true,
	});

	return area;
}
async function createArea(req) {
	const { name, emirateId, userId, status } = req.body;

	const area = await getAreaByName(name);

	if (area) {
		throw new ApiError(httpStatus.CONFLICT, 'This Area already exits');
	}

	const emirate = await adminEmirateService.getEmirateById(emirateId);

	if (!emirate) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Emirate not found');
	}
	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const createdArea = await db.area
		.create({
			name,
			emirate_id: emirateId,
			user_id: userId,
			status,
			// status_id: statusId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdArea;
}

async function getAreas(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const areas = await db.area.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		include: [
			{
				model: db.emirate,
				require: true,
				attributes: ['id', 'name'],
			},
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
		attributes: [
			'id',
			'name',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	for (const area of areas.rows) {
		await Promise.all(
			(area.neighbourhoods = await db.neighbourhood.findAll({
				where: { area_id: area.id },
				attributes: ['id', 'name'],
				raw: true,
			})),
		);
	}
	refactorCode(areas, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
		{
			title: 'emirate',
			items: ['id', 'name'],
		},
	]);
	return areas;
}

async function deleteAreaById(req) {
	const deletedArea = await db.area.destroy({
		where: { id: req.params.areaId || req.body.id },
	});

	if (!deletedArea) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Area not found');
	}

	return deletedArea;
}

async function updateArea(req) {
	const { name, emirateId, statusId, userId } = req.body;

	// if (name) {
	// 	const area = await getAreaByName(name);

	// 	if (area) {
	// 		throw new ApiError(httpStatus.CONFLICT, 'This Area already exits');
	// 	}
	// }
	if (emirateId) {
		const emirate = await adminEmirateService.getEmirateById(emirateId);

		if (!emirate) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Emirate not found');
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedArea = await db.area
		.update(
			{ ...req.body },
			{
				where: { id: req.params.areaId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedArea;
}

export default {
	getAreas,
	createArea,
	deleteAreaById,
	updateArea,
	getAreaById,
};
