import httpStatus from 'http-status'
const { getOffset } = require('../../../../utils/query.js');
const ApiError = require('../../../../utils/ApiError.js');
const config = require('../../../../config/config.js');
const db = require('../../../../db/models/index.js').default;
const userService = require('../../../user.service');
const {
	checkDeletedCondition,
	softDelete,
	reorderFunction,
} = require('../../../../utils/globals.js');
const { Op } = require('sequelize');

const provider = 'platinumlist';

async function getAffiliateCategoryByTitle(title) {
	const affiliateCategory = await db.affiliate.findOne({
		where: {
			title,
			provider,
			show: {
				[Op.or]: [true, null], // check if show is either true or null
			},
			...checkDeletedCondition,
		},
	});

	return affiliateCategory;
}
async function getAffiliateCategoriesMeta() {
	const affiliateCategory = await db.affiliate.findAll({
		where: {
			show: false,
		},
		attributes: ['id', 'title', 'reference_id'],
		order: [['title', 'ASC']],
		raw: true,
	});

	return affiliateCategory?.map((v) => {
		return { ...v, reference_id: v.reference_id[0] };
	});
}

// async function getAffiliateCategoryByReference(id) {
// 	const affiliateCategory = await db.affiliate.findOne({
// 		where: { reference_id: id, provider },
// 	});

// 	return affiliateCategory;
// }
async function getAffiliateCategoryByTitleWithId(title, id) {
	const affiliateCategory = await db.affiliate.findOne({
		where: {
			id: { [Op.ne]: id },
			title,
			provider,
			show: {
				[Op.or]: [true, null], // check if show is either true or null
			},
			...checkDeletedCondition,
		},
	});

	return affiliateCategory;
}

// async function getAffiliateCategoryByReferenceWithId(reference_id, id) {
// 	const affiliateCategory = await db.affiliate.findOne({
// 		where: { id: { [Op.ne]: id }, reference_id, provider },
// 	});

// 	return affiliateCategory;
// }

async function getAffiliateCategories(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const affiliateCategories = await db.affiliate.findAndCountAll({
		order: [
			['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			provider,
			...checkDeletedCondition,
			show: {
				[Op.or]: [true, null], // check if show is either true or null
			},
		},
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		offset,
		limit,
		raw: false,
	});

	return affiliateCategories;
}
async function getAffiliateCategoriesTest(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const affiliateCategories = await db.affiliate.findAndCountAll({
		order: [
			['id', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			provider,
			show: false,
		},

		offset,
		limit,
		raw: false,
	});

	return affiliateCategories;
}

async function createAffiliateCategory(req) {
	const { title, image, referenceId, color, userId } = req.body;

	const affiliateCategoryTitle = await getAffiliateCategoryByTitle(title);

	if (affiliateCategoryTitle) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This affiliateCategory title already exits',
		);
	}
	// const affiliateCategoryReference =
	// 	await getAffiliateCategoryByReference(referenceId);

	// if (affiliateCategoryReference) {
	// 	throw new ApiError(
	// 		httpStatus.CONFLICT,
	// 		'This affiliateCategory reference id already exits',
	// 	);
	// }

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const createdAffiliateCategory = await db.affiliate
		.create({
			provider,
			title,
			image,
			reference_id: JSON.parse(referenceId),
			color,
			user_id: userId,
			status: true,
			show: true,
		})
		.then(async (resultEntity) => {
			return resultEntity.get({ plain: true });
		});

	return createdAffiliateCategory;
}

async function reorder(req) {
	await reorderFunction(req.body.order, 'affiliate');
}

async function updateAffiliateCategory(req) {
	const { title, referenceId, userId } = req.body;
	const id = req.params.affiliateCategoryId || req.body.id;

	if (title) {
		const affiliateCategoryTitle = await getAffiliateCategoryByTitleWithId(
			title,
			id,
		);

		if (affiliateCategoryTitle) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This affiliateCategory title already exits',
			);
		}
	}
	// if (referenceId) {
	// 	const affiliateCategoryReference =
	// 		await getAffiliateCategoryByReferenceWithId(referenceId, id);

	// 	if (affiliateCategoryReference) {
	// 		throw new ApiError(
	// 			httpStatus.CONFLICT,
	// 			'This affiliateCategory reference id already exits',
	// 		);
	// 	}
	// }

	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	let referenceIdArr = undefined;
	if (referenceId) {
		referenceIdArr = JSON.parse(referenceId);
	}
	const updatedAffiliateCategory = await db.affiliate
		.update(
			{ ...req.body, reference_id: referenceIdArr, user_id: userId },
			{
				where: { id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedAffiliateCategory;
}

async function deleteAffiliateCategoryById(req) {
	const id = req.params.affiliateCategoryId || req.body.id;
	await softDelete(req, 'affiliate', id);
	return true;
}

export default {
	getAffiliateCategories,
	createAffiliateCategory,
	updateAffiliateCategory,
	deleteAffiliateCategoryById,
	getAffiliateCategoriesMeta,
	getAffiliateCategoriesTest,
	reorder,
};
