const express = require('express');
const {
	websiteSubCategoryController,
} = require('../../../controllers/Website');

const router = express.Router();

router.route('/').get(websiteSubCategoryController.getCategories);

export default router;
