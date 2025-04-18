const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { homeController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(homeController.getSlides)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		homeController.addSlide,
	);
router.route('/monthlydeals').get(homeController.getMonthlyDeals);
router
	.route('/:slideId')
	.delete(homeController.deleteSlide)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		homeController.updateSlide,
	);
router.route('/type/:type').get(homeController.getSlidesByType);

export default router;
