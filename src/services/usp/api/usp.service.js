import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const userService = require('../../user.service');
const { refactorCode, checkDeletedCondition } = require('../../../utils/globals.js');

async function getUspById(id) {
	const usp = await db.usp.findOne({
		where: { id },
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
	});
	// for (const usp of usps.rows) {
	const sub_categories = await db.usp_to_subcategory.findAll({
		where: {
			usp_id: usp.id,
		},
		attributes: ['sub_category_id'],
		raw: true,
	});
	const subCategoryIds = sub_categories.map(
		(subCategory) => subCategory.sub_category_id,
	);
	usp.sub_categories = await db.sub_category.findAll({
		where: { id: subCategoryIds },
		attributes: ['id', 'title'],
		raw: false,
	});
	// }1234
	refactorCode(usp, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return usp;
}
async function getUsps(req) {
	const usps = await db.usp.findAll({
		where: { status: true, ...checkDeletedCondition },
		order: [['title', 'ASC']],
		attributes: ['id', 'title'],
		raw: true,
	});
	return usps;
}

export default {
	getUsps,
	getUspById,
};
