const express = require('express');
const { parentDealController } = require('../../controllers');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(parentDealController.getParentDeals)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		parentDealController.addParentDeal,
	);
router
	.route('/:parentDealId')
	.delete(parentDealController.deleteParentDeal)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		parentDealController.updateParentDeal,
	);

export default router;
