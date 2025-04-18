import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import { adminUspService, apiUspService } from '../services'

const getUsps = catchAsync(async (req, res) => {
	const clientIdCms = req.headers['clientid'] === 'cms';
	const usps = clientIdCms
		? await adminUspService.getUsps(req)
		: await apiUspService.getUsps(req);
	res.send({ usps });
});

const addUsp = catchAsync(async (req, res) => {
	const usp = await adminUspService.createUsp(req);
	res.status(httpStatus.CREATED).send({ usp });
});

const deleteUsp = catchAsync(async (req, res) => {
	const usp = await adminUspService.deleteUspById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateUsp = catchAsync(async (req, res) => {
	const usp = await adminUspService.updateUsp(req);
	res.status(httpStatus.ACCEPTED).send({ usp });
});
export default {
	getUsps,
	addUsp,
	deleteUsp,
	updateUsp,
};
