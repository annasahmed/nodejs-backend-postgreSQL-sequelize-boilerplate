import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;

async function getpackageById(subscriptionId) {
	return await db.packages.findOne({
		where: { id: subscriptionId },
	});
}

async function getPackageByName(name) {
	return await db.packages.findOne({
		where: { name, status: true },
	});
}

async function getPackages(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	return await db.packages.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		limit,
		offset,
		raw: true,
	});
}
async function getMetaPackages(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	return await db.packages.findAndCountAll({
		order: [
			['name', 'ASC']
		],
		where: {
			status: true,
		},
		limit,
		offset,
		raw: true,
	});
}

async function createPackage(req) {
	const { name, description, fee, month, trialMonths } = req.body;
	const existedSubscription = await getPackageByName(name);

	if (existedSubscription) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'This Subscription already exits',
		);
	}

	return await db.packages
		.create({
			name,
			description,
			fee,
			month,
			trial_months: trialMonths,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));
}

async function updatePackage(req) {
	if (req.body.name) {
		const existedSubscription = await getPackageByName(req.body.name);

		if (existedSubscription) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This Subscription already exits',
			);
		}
	}
	if (req.body.trialMonths) {
		req.trial_months = req.body.trialMonths;
	}
	const updatedSubscription = await db.packages
		.update(
			{ ...req.body },
			{
				where: { id: req.params.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);
	return updatedSubscription;
}
async function deletePackageById(SubscriptionId) {
	// const deletedSubscription = await db.packages.destroy({
	// 	where: { id: SubscriptionId },
	// });
	// if (!deletedSubscription) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
	// }
	// return deletedSubscription;
}
export default {
	getSubscriptionById: getpackageById,
	getSubscriptions: getPackages,
	createSubscription: createPackage,
	updateSubscription: updatePackage,
	deleteSubscriptionById: deletePackageById,
	getMetaSubscription: getMetaPackages,
};
