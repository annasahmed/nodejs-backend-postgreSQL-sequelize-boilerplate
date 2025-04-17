const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { adminReportsService } = require('../../services');

const appUsersReport = catchAsync(async (req, res) => {
	const records = await adminReportsService.appUsersReport(req);
	res.send({ ...records });
});
const dealRedemptionReport = catchAsync(async (req, res) => {
	const records = await adminReportsService.dealRedemptionReport(req);
	res.send({ ...records });
});
const vendorReport = catchAsync(async (req, res) => {
	const records = await adminReportsService.vendorsReport(req);
	res.send({ ...records });
});
const specialDealsReport = catchAsync(async (req, res) => {
	const records = await adminReportsService.specialDealsReport(req);
	res.send({ ...records });
});
const homepageReport = catchAsync(async (req, res) => {
	const records = await adminReportsService.homepageReport(req);
	res.send({ ...records });
});
const getExpiringHappenings = catchAsync(async (req, res) => {
	const records = await adminReportsService.getExpiringHappenings(req);
	res.send({ ...records });
});

module.exports = {
	appUsersReport,
	dealRedemptionReport,
	vendorReport,
	homepageReport,
	getExpiringHappenings,
	specialDealsReport,
};
