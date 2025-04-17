const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const {
	refactorCode,
	checkDeletedCondition,
	softDelete,
} = require('../../../utils/globals.js');
const { Op } = require('sequelize');
const { default: axios } = require('axios');

async function getEmirateByName(name) {
	const emirate = await db.emirate.findOne({
		where: { name },
	});

	return emirate;
}
async function getEmirateById(id) {
	const emirate = await db.emirate.findOne({
		where: { id },
		raw: true,
	});

	return emirate;
}
async function createEmirate(req) {
	const { name, label, country, statusId, userId, status } = req.body;

	const emirate = await getEmirateByName(name);

	if (emirate) {
		throw new ApiError(httpStatus.CONFLICT, 'This emirate already exits');
	}

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const createdEmirate = await db.emirate
		.create({
			name,
			label,
			country,
			status,
			user_id: userId,
			// status_id: statusId,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdEmirate;
}

async function getEmirates(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit, name, label } = req.query;
	const searchCondition = { ...checkDeletedCondition };
	if (name) {
		searchCondition.name = { [Op.iLike]: `%${name}%` };
	}
	if (label) {
		searchCondition.label = { [Op.iLike]: `%${label}%` };
	}
	const offset = getOffset(page, limit);

	const emirates = await db.emirate.findAndCountAll({
		where: searchCondition,
		order: [
			['name', 'ASC'],
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
		attributes: [
			'id',
			'name',
			'label',
			'country',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	for (const emirate of emirates.rows) {
		await Promise.all(
			(emirate.areas = await db.area.findAll({
				where: { emirate_id: emirate.id, ...checkDeletedCondition },
				attributes: ['id', 'name'],
				raw: true,
			})),
			(emirate.neighbourhoods = await db.neighbourhood.findAll({
				where: { emirate_id: emirate.id, ...checkDeletedCondition },
				attributes: ['id', 'name'],
				raw: true,
			})),
		);
	}
	refactorCode(emirates, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return emirates;
}

async function deleteEmirateById(req) {
	const id = req.params.emirateId || req.body.id;
	await softDelete(req, 'emirate', id);
	return true;
}

async function updateEmirate(req) {
	const { name, statusId, userId } = req.body;

	if (name) {
		const emirate = await getEmirateByName(name);

		if (emirate) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This emirate already exits',
			);
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedEmirate = await db.emirate
		.update(
			{ ...req.body },
			{
				where: { id: req.params.emirateId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedEmirate;
}

async function getCountries() {
	return await axios
		.get('https://api.first.org/data/v1/countries?limit=250')
		.then((res) => {
			return [...Object.entries(res.data.data)];
		})
		.catch((err) => {
			console.log('error', 'chkk');
		});
}

module.exports = {
	getEmirates,
	createEmirate,
	deleteEmirateById,
	updateEmirate,
	getEmirateById,
	getCountries,
};
