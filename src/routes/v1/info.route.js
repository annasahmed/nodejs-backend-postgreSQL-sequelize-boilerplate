import express from 'express';
import validate from '../../middlewares/validate.js';
import userValidation from '../../validations/user.validation.js';
import { infoController } from '../../controllers/index.js';
import upload from '../../middlewares/multerUpload.js';

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

export default router;
