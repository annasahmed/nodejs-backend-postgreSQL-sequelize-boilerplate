const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { emirateController } = require('../../controllers');

const router = express.Router();

router
	.route('/')
	.get(emirateController.getEmirates)
	.post(emirateController.addEmirate);
router
	.route('/:emirateId')
	.delete(emirateController.deleteEmirate)
	.patch(emirateController.updateEmirate);

module.exports = router;
