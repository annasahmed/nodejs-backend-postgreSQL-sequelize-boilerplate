import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
const { adminReportsService } from '../../services'

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

export default {
	appUsersReport,
	dealRedemptionReport,
	vendorReport,
	homepageReport,
	getExpiringHappenings,
	specialDealsReport,
};
