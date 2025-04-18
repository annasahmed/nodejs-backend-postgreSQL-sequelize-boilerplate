import httpStatus from 'http-status'
const ApiError = require('../../../utils/ApiError.js');
const db = require('../../../db/models/index.js').default;

async function getParentDealById(id) {
	const parentDeal = await db.parent_deal.findOne({
		where: { id },
	});

	return parentDeal;
}
async function createParentDeal(req) {
	const { title, image, type, discount } = req.body;

	const createdParentDeal = await db.parent_deal
		.create({
			title,
			image,
			type,
			discount,
		})
		.then(async (resultEntity) => {
			return resultEntity.get({ plain: true });
		});
	return createdParentDeal;
}

async function getParentDeals(req) {
	const parentDeals = await db.parent_deal.findAll({
		order: [['id', 'DESC']],
		attributes: ['id', 'title', 'image', 'discount', 'type'],
		raw: true,
	});

	return parentDeals;
}

async function deleteParentDealById(req) {
	const id = req.params.parentDealId || req.body.id;

	const deletedDeal = await db.parent_deal.destroy({
		where: { id },
	});

	if (!deletedDeal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Parent Deal not found');
	}

	return deletedDeal;
}

async function updateParentDeal(req) {

	const updatedDeal = await db.parent_deal
		.update(
			{ ...req.body },
			{
				where: { id: req.params.parentDealId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)

		.then(async (data) => {
			return data[1];
		});

	return updatedDeal;
}

export default {
	getParentDeals,
	createParentDeal,
	deleteParentDealById,
	updateParentDeal,
	getParentDealById,
};
