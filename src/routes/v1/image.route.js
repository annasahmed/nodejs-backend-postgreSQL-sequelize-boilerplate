const express = require('express');
const { imageController } = require('../../controllers');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router.route('/').post(
	upload.fields([{ name: 'image', maxCount: 1 }]),

	imageController.addImage,
);
router.route('/move').post(imageController.moveImage);
// router.route('/delete').post(imageController.deleteImage);
router.route('/resizeimage').post(imageController.resizeImage);

module.exports = router;
