const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { infoController } = require('../../controllers');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router.route('/').get(infoController.getInfos).post(infoController.addInfo);
router
	.route('/:infoId')
	.delete(infoController.deleteInfo)
	.patch(
		upload.fields([{ name: 'image' }, { name: 'pdf_file' }]),
		infoController.updateInfo,
	)
	.post(
		upload.fields([{ name: 'image' }, { name: 'pdf_file' }]),
		infoController.updateInfo,
	);

module.exports = router;
