import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import {
	adminSubCategoryService,
	imageService,
	adminCuisineService,
	adminUspService,
} from '../services/index.js';


const getSubCategoryById = catchAsync(async (req, res) => {
	const subCategory = await adminSubCategoryService.getSubCategoryById(req);
	res.send({ subCategory });
});
const getSubCategories = catchAsync(async (req, res) => {
	const subCategories = await adminSubCategoryService.getSubCategories(req);
	res.send({ subCategories });
});
const getSubCategoriesWebsite = catchAsync(async (req, res) => {
	const subCategories =
		await adminSubCategoryService.getSubCategoriesWebsite(req);
	res.send({ subCategories });
});
const attachSubCategoriesToPlaceWebsite = catchAsync(async (req, res) => {
	const subCategories =
		await adminSubCategoryService.attachSubCategoriesToPlaceWebsite(req);
	res.send({ subCategories });
});
const reorderSubCategories = catchAsync(async (req, res) => {
	await adminSubCategoryService.reorder(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'successfull' });
});

const addSubCategory = catchAsync(async (req, res) => {
	req.body.folder = 'subcategory';
	const image =
		req?.files.image &&
		(await imageService.uploadImageToS3(req?.files?.image[0]));
	req.body.image = image || '';
	const subCategory = await adminSubCategoryService.createSubCategory(req);
	res.status(httpStatus.CREATED).send({ subCategory });
});
const deleteSubCategory = catchAsync(async (req, res) => {
	const subCategory =
		await adminSubCategoryService.deleteSubCategoryById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateSubCategory = catchAsync(async (req, res) => {
	const { files } = req;
	req.body.folder = 'subcategory';

	if (files?.image?.length > 0) {
		const image = await imageService.uploadImageToS3(req.files.image[0]);
		req.body.image = image;
	}
	const subCategory = await adminSubCategoryService.updateSubCategory(req);
	res.status(httpStatus.ACCEPTED).send({ subCategory });
});
export default {
	getSubCategories,
	getSubCategoriesWebsite,
	deleteSubCategory,
	updateSubCategory,
	addSubCategory,
	getSubCategoryById,
	reorderSubCategories,
	attachSubCategoriesToPlaceWebsite,
};
