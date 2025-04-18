const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const {
	vendorPortalController,
	placeController,
} = require('../../../controllers');

const router = express.Router();

router
	.post(
		'/login',
		validate(authValidation.vendorLogin),
		vendorPortalController.login,
	)
	.get('/contract/:vendorId', vendorPortalController.getContract)
	.patch('/contract/:vendorId', vendorPortalController.signContract)
	.get('/place/:vendorId', vendorPortalController.getVendorById)
	.post('/editrequest', placeController.requestEditVendor)
	.patch('/update-password', vendorPortalController.updatePasswordVendor)
	.post('/reset-password', vendorPortalController.sendResetPasswordEmail)

	.get('/:vendorId/invoices', vendorPortalController.getInvoicesByVendor)
	.get('/:vendorId/redemption', vendorPortalController.getRedemptionsByVendor)
	.get(
		'/:vendorId/redemption-amount',
		vendorPortalController.getTotalRedemptionAmountByVendor,
	)
	.get(
		'/:vendorId/unpaid-invoices',
		vendorPortalController.getTotalUnpaidInvoicesByVendor,
	);

export default router;
