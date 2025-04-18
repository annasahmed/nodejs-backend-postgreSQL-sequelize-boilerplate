const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { placeController, checkController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/subscription')
	.get(checkController.getSubscriptions)
	.post(checkController.createSubscription);
router
	.route('/trending')
	.get(checkController.getTrendings)
	.post(checkController.createTrending);
router
	.route('/subscriptionStatus')
	.get(checkController.getSubscriptionsStatuses)
	.post(checkController.createSubscriptionStatus);

router.route('/tables').get(checkController.getTables);
router
	.route('/redemptioninvoiceEmail')
	.get(checkController.sendSingleRedemptionInvoiceEmail);
router.route('/receiptEmail/:id').get(checkController.sendReceiptEmail);
router.route('/catTiming').post(checkController.createDaysCategory);

// router.route('/happening').get(checkController.getHappenings).post(checkController.getHappenings);
// router.route('/timing').get(checkController.getTimings).post(checkController.getTimings);
// router
// 	.route('/:placeId')
// 	.get(placeController.getPlaceById)
// 	.delete(placeController.deletePlace)
// 	.patch(
// 		upload.fields([
// 			{ name: 'logo', maxCount: 1 },
// 			{ name: 'menu', maxCount: 1 },
// 			{ name: 'featured' },
// 			{ name: 'reel' },
// 		]),
// 		placeController.updatePlace,
// 	);

export default router;
