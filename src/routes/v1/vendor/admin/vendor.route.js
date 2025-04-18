const express = require('express');
const validate = require('../../../../middlewares/validate');
const vendorValidation = require('../../../../validations/Vendor/Vendor.validation');
const {
	vendorController,
	placeController,
} = require('../../../../controllers');
const upload = require('../../../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(vendorController.getVendors)
	.post(
		validate(vendorValidation.validateCreateVendor),
		vendorController.addVendor,
	);
router.route('/:vendorId/places').post(vendorController.addPlaceToVendor);
router
	.route('/:vendorId/send-onbarding-email')
	.get(vendorController.sendOnbaordingEmail);

router
	.route('/:vendorId/send-contract')
	.post(
		upload.fields([{ name: 'contract_file', maxCount: 1 }]),
		vendorController.sendContract,
	);
router.route('/:vendorId/send-invoice').post(vendorController.sendInvoice);
router
	.route('/:vendorId/update-vendor-place')
	.post(vendorController.changeVendorPlacePackage);
router
	.route('/:vendorId/detach-place/:placeId')
	.delete(vendorController.detachPlace);

router.route('/invoices/:vendorId').get(vendorController.getInvoices);
router.route('/invoices/send/:id').post(vendorController.sendInvoiceToEmail);
router
	.route('/invoices/pay/:stripe_invoice_id')
	.post(vendorController.payInvoice);

router
	.route('/invoices/invoice/send/:invoiceId')
	.post(vendorController.sendInvoiceById);

router
	.route('/:vendorId')
	.get(vendorController.getVendorById)
	.delete(vendorController.deleteVendor)
	.patch(
		validate(vendorValidation.validateUpdateVendor),
		vendorController.updateVendor,
	);

router.route('/export/all').get(vendorController.getVendorsExport);

export default router;
