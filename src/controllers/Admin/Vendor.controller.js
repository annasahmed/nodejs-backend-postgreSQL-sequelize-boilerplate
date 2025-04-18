import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import {
	adminVendorService,
	vendorInvoiceService,
	adminInvoiceService,
} from '../../services'
import ApiError from '../../utils/ApiError'
import stripeService from '../../services/Admin'

// Get vendor by ID
const getVendorById = catchAsync(async (req, res) => {
	const { vendorId } = req.params;
	if (!vendorId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Vendor ID is required');
	}
	const vendor = await adminVendorService.getVendorById(vendorId);
	res.send({ vendor });
});

// Get all vendors with pagination
const getVendors = catchAsync(async (req, res) => {
	const vendors = await adminVendorService.getVendors(req);
	res.send({ ...vendors });
});
// Get all vendors for export
const getVendorsExport = catchAsync(async (req, res) => {
	const vendors = await adminVendorService.getVendorsExport(req);
	res.send({ vendors });
});

// Add a new vendor
const addVendor = catchAsync(async (req, res) => {
	const vendor = await adminVendorService.createVendor(req);
	res.status(httpStatus.CREATED).send({ vendor });
});

// Delete a vendor by ID
const deleteVendor = catchAsync(async (req, res) => {
	await adminVendorService.deleteVendorById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'Deleted successfully' });
});

// Update a vendor by ID
const updateVendor = catchAsync(async (req, res) => {
	const vendor = await adminVendorService.updateVendor(req);
	res.status(httpStatus.ACCEPTED).send({ vendor });
});

const addPlaceToVendor = catchAsync(async (req, res) => {
	const vendor = await adminVendorService.addPlaceToVendor(req);
	res.status(httpStatus.CREATED).send({ vendor });
});
const changeVendorPlacePackage = catchAsync(async (req, res) => {
	const vendor = await adminVendorService.changeVendorPlacePackage(req);
	res.status(httpStatus.CREATED).send({ vendor });
});
const sendContract = catchAsync(async (req, res) => {
	const vendor = await adminVendorService.sendContract(req);
	res.status(httpStatus.CREATED).send({ vendor });
});
const sendInvoice = catchAsync(async (req, res) => {
	const invoice = await adminVendorService.sendInvoice(req);
	res.status(httpStatus.CREATED).send({ invoice });
});
const detachPlace = catchAsync(async (req, res) => {
	const vendor = await adminVendorService.detachPlace(req);
	res.status(httpStatus.CREATED).send({ vendor });
});

const getInvoices = catchAsync(async (req, res) => {
	const clientIdCms = req.headers['clientid'] === 'vendor';
	const invoices = clientIdCms
		? await vendorInvoiceService.getInvoices(req)
		: await adminInvoiceService.getInvoices(req);
	res.send({ invoices });
});
const sendInvoiceToEmail = catchAsync(async (req, res) => {
	const invoices = await adminInvoiceService.sendInvoiceToEmail(req);
	res.send({ status: true });
});
const payInvoice = catchAsync(async (req, res) => {
	const invoice = await stripeService.markInvoiceAsPaid(req);
	res.send({ status: true, invoice });
});

const sendInvoiceById = catchAsync(async (req, res) => {
	const invoice = await vendorInvoiceService.sendRedemptionInvoiceEmail(req);
	res.send({
		status: true,
		message: 'invoice sent sucessfully',
		data: invoice,
	});
});

const sendOnbaordingEmail = catchAsync(async (req, res) => {
	await adminVendorService.sendOnboardingEmailVendor(req.params.vendorId);
	res.send({
		status: true,
		message: 'Email sent sucessfully',
	});
});

export default {
	getVendors,
	getVendorById,
	addVendor,
	deleteVendor,
	updateVendor,
	addPlaceToVendor,
	sendContract,
	detachPlace,
	sendInvoice,
	getInvoices,
	sendInvoiceToEmail,
	payInvoice,
	changeVendorPlacePackage,
	sendInvoiceById,
	sendOnbaordingEmail,
	getVendorsExport,
};
