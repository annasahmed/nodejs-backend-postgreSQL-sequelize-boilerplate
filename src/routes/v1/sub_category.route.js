const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { subCategoryController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(subCategoryController.getSubCategories)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		subCategoryController.addSubCategory,
	);

router.route('/website').get(subCategoryController.getSubCategoriesWebsite);
router
	.route('/website/:id')
	.post(subCategoryController.attachSubCategoriesToPlaceWebsite);

router
	.route('/:categoryId')
	.get(subCategoryController.getSubCategoryById)
	.delete(subCategoryController.deleteSubCategory)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		subCategoryController.updateSubCategory,
	);

router.route('/reorder').post(subCategoryController.reorderSubCategories);

export default router;
