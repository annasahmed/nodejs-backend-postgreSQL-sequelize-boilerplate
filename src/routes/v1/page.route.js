const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { pageController } = require('../../controllers');

const router = express.Router();

router.route('/').get(pageController.getPages).post(
	pageController.addPage,
);
router
	.route('/:pageId')
	.get(pageController.getPageById)
	.delete(pageController.deletePage)
	.patch(pageController.updatePage);

export default router;
