const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { subscriptionController } = require('../../controllers');

const router = express.Router();

router
	.route('/')
	.get(subscriptionController.getSubscriptions)
	.post(subscriptionController.createSubscription);

router.route('/:id').patch(subscriptionController.updateSubscription);

module.exports = router;
