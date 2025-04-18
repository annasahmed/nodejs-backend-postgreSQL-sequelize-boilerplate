import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { adminParentDealService, imageService } from '../services/index.js';


const getParentDeals = catchAsync(async (req, res) => {
	const parentDeals = await adminParentDealService.getParentDeals(req);
	res.send({ parentDeals });
});

const addParentDeal = catchAsync(async (req, res) => {
	const image =
		req?.files.image &&
		(await imageService.uploadImageToS3(req?.files?.image[0], 'deals'));
	req.body.image = image || '';
	const ParentDeal = await adminParentDealService.createParentDeal(req);
	res.status(httpStatus.CREATED).send({ ParentDeal });
});

const deleteParentDeal = catchAsync(async (req, res) => {
	const ParentDeal = await adminParentDealService.deleteParentDealById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateParentDeal = catchAsync(async (req, res) => {
	if (req?.files?.image?.length > 0) {
		const image =
			req?.files.image &&
			(await imageService.uploadImageToS3(req?.files?.image[0], 'deals'));
		req.body.image = image || '';
	}
	const ParentDeal = await adminParentDealService.updateParentDeal(req);
	res.status(httpStatus.ACCEPTED).send({ ParentDeal });
});
export default {
	getParentDeals,
	addParentDeal,
	deleteParentDeal,
	updateParentDeal,
};
