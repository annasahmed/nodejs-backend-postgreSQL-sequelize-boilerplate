const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const authValidation = require('../../validations/auth.validation');
const {
	userController,
	authController,
	appuserController,
	userSavingsController,
} = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router.route('/test/validate').get(appuserController.validateColumns);
router.route('/').get(appuserController.getAppUsers);
router.route('/savings').get(userSavingsController.userSavings);
router
	.route('/savings/history')
	.get(userSavingsController.userSavingRecentTransaction);
router
	.route('/:userId')
	.get(appuserController.getAppUserById)
	.patch(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		appuserController.updateAppUser,
	)
	.delete(
		// grantAccess('deleteAny', resources.USERINFO),
		// validate(userValidation.deleteUser),
		appuserController.deleteAppUser,
	);
// router
// 	.route('/favourite/:userId')
// 	.post(appuserController.getFavouritePlaces)
router
	.route('/favourite/:userId')
	.get(appuserController.getFavouritePlaces)
	.post(appuserController.addFavouritePlace)
	.delete(appuserController.removeFavouritePlace);

router.get('/details/:userId', appuserController.getAppUserDetails);

module.exports = router;
