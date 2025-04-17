const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { uspController, stripeController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const verifyStripeSignature = require('../../middlewares/verifyStripe');

const router = express.Router();

router
	.route('/invoice-paid')
	.post(
		express.raw({ type: 'application/json' }),
		verifyStripeSignature,
		stripeController.stripeInvoicePaid,
	);
router
	.route('/invoice-paid/manual')
	.post(stripeController.stripeInvoicePaidManual);

module.exports = router;
