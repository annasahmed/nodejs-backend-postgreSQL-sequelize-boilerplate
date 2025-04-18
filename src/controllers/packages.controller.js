import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const {
	adminUspService,
	apiUspService,
	packagesService,
} from '../services'

const getPackages = catchAsync(async (req, res) => {
	const packages = await packagesService.getPackages(req);
	res.send({ packages });
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
