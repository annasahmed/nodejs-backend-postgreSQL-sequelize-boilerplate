import catchAsync from '../utils/catchAsync';
const { adminCategoryService } from '../services'

const addCategory = catchAsync(async (req, res) => {
	const categories = await adminCategoryService.createCategory(req);
	res.send({ categories });
});

const getCategories = catchAsync(async (req, res) => {
	const categories = await adminCategoryService.getCategories(req);
	res.send({ categories });
});

export default {
	addCategory,
	getCategories,
};
