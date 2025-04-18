const express = require('express');
const { platinumListController } = require('../../../controllers');
const upload = require('../../../middlewares/multerUpload');

const router = express.Router();

router.route('/').get(platinumListController.getEvents);
router.route('/details').get(platinumListController.getEventsByEventType);

router
	.route('/categories')
	.get(platinumListController.getApiAffiliateCategories);
router.route('/areas').get(platinumListController.getApiAffiliateAreas);

router
	.route('/admin/')
	.get(platinumListController.getAdminAffiliateCategories)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		platinumListController.addAffiliateCategory,
	);
router
	.route('/admin/:affiliateCategoryId')
	.delete(platinumListController.deleteAffiliateCategory)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		platinumListController.updateAffiliateCategory,
	);

router
	.route('/admin/reorder')
	.post(platinumListController.reorderAffiliateCategory);

export default router;
