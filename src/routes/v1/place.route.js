const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { placeController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');
const { placeValidation } = require('../../validations');

const router = express.Router();

router
	.route('/')
	.get(placeController.getPlaces)
	.post(
		// validate(placeValidation.updatePlace),
		upload.fields([
			{ name: 'logo', maxCount: 1 },
			{ name: 'menuFile', maxCount: 1 },
			{ name: 'featured' },
			{ name: 'reel' },
		]),
		placeController.addPlace,
	);
router.route('/associate').post(placeController.associatePlace);
// router.route('/email/:placeId').post(placeController.sendWelcomeEmailVendor);
router.route('/count').get(placeController.getFilteredPlaces);
router.route('/timing/:timingId').post(placeController.deleteTiming);
router.route('/timing').get(placeController.getTimings);
router.route('/media/reorder/:placeId').patch(placeController.reorderMedia);
router.route('/media/:placeId').patch(placeController.updateMedia);

router
	.route('/:placeId')
	.get(placeController.getPlaceById)
	.delete(placeController.deletePlace)
	.patch(
		// validate(placeValidation.updatePlace),
		upload.fields([
			{ name: 'logo', maxCount: 1 },
			{ name: 'menuFile', maxCount: 1 },
			{ name: 'menuImage', maxCount: 1 },
			{ name: 'featured' },
			{ name: 'reel' },
		]),
		placeController.updatePlace,
	);
router.route('/title/all').get(placeController.getPlacesTitle);
router.route('/timing/maps').patch(placeController.updatePlaceTiming);
router.route('/phone/maps').post(placeController.createPlaceByPhone);
router.route('/ratings/all').patch(placeController.updateRatingsAndReviews);
router.route('/title/:title').patch(placeController.updatePlaceByTitle);
router.route('/import/:placeId').patch(placeController.updatePlaceByByIdImport);
router
	.route('/import/images/:slug')
	.patch(
		upload.fields([
			{ name: 'logo', maxCount: 1 },
			{ name: 'menu', maxCount: 1 },
			{ name: 'featured' },
			{ name: 'reel' },
		]),
		placeController.updateImagesBySlug,
	);

router.route('/redemption/:placeId').get(placeController.getRedemptions);
router.route('/filter/category').post(placeController.createPlaceToCategory);
router.route('/editrequest').post(placeController.requestEditVendor);

router
	.route('/happening/update')
	.get(placeController.getPlaceHappening)
	.post(placeController.createPlaceHappening)
	.patch(placeController.updatePlaceHappening);
router
	.route('/happening/update/delete')
	.patch(placeController.deletePlaceHappening);
router
	.route('/happening/update/:happeningId')
	.patch(placeController.updatePlaceHappeningStatus);

export default router;
