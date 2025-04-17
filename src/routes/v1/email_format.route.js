const express = require('express');
const { emailFormatController } = require('../../controllers');

const router = express.Router();

router
	.route('/')
	.get(emailFormatController.getEmailFormats)
	.post(emailFormatController.addEmailFormat);
router.route('/:emailFormatId').patch(emailFormatController.updateEmailFormats);

module.exports = router;
