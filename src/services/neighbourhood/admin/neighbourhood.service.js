const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const {
	userService,
	adminEmirateService,
	adminAreaService,
} = require('../../index.js');
const {
	refactorCode,
	checkDeletedCondition,
	softDelete,
} = require('../../../utils/globals.js');

async function getNeighbourhoodByName(name) {
	const neighbourhood = await db.neighbourhood.findOne({
		where: { name },
	});

	return neighbourhood;
}
async function createNeighbourhood(req) {
	const { name, areaId, emirateId, statusId, userId, status } = req.body;

	const neighbourhood = await getNeighbourhoodByName(name);

	if (neighbourhood) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This Neighbourhood already exits',
		);
	}

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}
	const emirate = await adminEmirateService.getEmirateById(emirateId);

	if (!emirate) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Emirate not found');
	}

	if (areaId) {
		const area = await adminAreaService.getAreaById(areaId);

		if (!area) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Area not found');
		}
	}

	const createdNeighbourhood = await db.neighbourhood
		.create({
			name,
			status,
			emirate_id: emirateId,
			area_id: areaId,
			user_id: userId,
			// status_id: statusId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdNeighbourhood;
}

async function getNeighbourhoods(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const neighbourhoods = await db.neighbourhood.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: { ...checkDeletedCondition },
		include: [
			{
				model: db.emirate,
				require: true,
				attributes: ['id', 'name'],
			},
			{
				model: db.area,
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
	refactorCode(neighbourhoods, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'emirate',
			items: ['id', 'name'],
		},
		{
			title: 'area',
			items: ['id', 'name'],
		},
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	return neighbourhoods;
}

async function deleteNeighbourhoodById(req) {
	const id = req.params.neighbourhoodId || req.body.id;
	await softDelete(req, 'neighbourhood', id);
	return true;
}

async function updateNeighbourhood(req) {
	const { name, emirateId, areaId, statusId, userId } = req.body;

	// if (name) {
	// 	const neighbourhood = await getNeighbourhoodByName(name);

	// 	if (neighbourhood) {
	// 		throw new ApiError(
	// 			httpStatus.CONFLICT,
	// 			'This Neighbourhood already exits',
	// 		);
	// 	}
	// }
	if (emirateId) {
		const emirate = await adminEmirateService.getEmirateById(emirateId);

		if (!emirate) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Emirate not found');
		}
	}
	if (areaId) {
		const area = await adminAreaService.getAreaById(areaId);

		if (!area) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Area not found');
		}
	}

	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedNeighbourhood = await db.neighbourhood
		.update(
			{ ...req.body },
			{
				where: { id: req.params.neighbourhoodId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedNeighbourhood;
}

module.exports = {
	getNeighbourhoods,
	createNeighbourhood,
	deleteNeighbourhoodById,
	updateNeighbourhood,
};
