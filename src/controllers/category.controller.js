const catchAsync = require('../utils/catchAsync');
const { adminCategoryService } = require('../services');

const addCategory = catchAsync(async (req, res) => {
	const categories = await adminCategoryService.createCategory(req);
	res.send({ categories });
});

const getCategories = catchAsync(async (req, res) => {
	const categories = await adminCategoryService.getCategories(req);
	res.send({ categories });
});

module.exports = {
	addCategory,
	getCategories,
};
