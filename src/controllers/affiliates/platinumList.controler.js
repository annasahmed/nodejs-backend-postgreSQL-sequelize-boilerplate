import catchAsync from '../../utils/catchAsync'
const {
	apiPlatinumListService,
	adminPlatinumListService,
	imageService,
} from '../../services'
import httpStatus from 'http-status'

// api

const getApiAffiliateCategories = catchAsync(async (req, res) => {
	const affiliateCategories =
		await apiPlatinumListService.getAffiliateCategories(req);
	res.send({ affiliateCategories });
});

const getApiAffiliateAreas = catchAsync(async (req, res) => {
	const affiliateAreas = await apiPlatinumListService.getAffiliateAreas(req);
	res.send({ affiliateAreas });
});

const getEvents = catchAsync(async (req, res) => {
	const events = await apiPlatinumListService.getEvents(req);
	res.send({ events: events.data, apiUrl: events.apiUrl });
});

const getEventsByEventType = catchAsync(async (req, res) => {
	const events = await apiPlatinumListService.getEventsByEventType(req);
	res.send({ events });
});

// admin

const getAdminAffiliateCategories = catchAsync(async (req, res) => {
	const clientIdTest = req.headers['clientid'] === 'test';
	const affiliateCategories = clientIdTest
		? await adminPlatinumListService.getAffiliateCategoriesTest(req)
		: await adminPlatinumListService.getAffiliateCategories(req);
	res.send({ affiliateCategories });
});

const addAffiliateCategory = catchAsync(async (req, res) => {
	req.body.folder = 'affiliateCategory';
	const image =
		req?.files?.image &&
		(await imageService.uploadImageToS3(req?.files?.image[0]));
	req.body.image = image || '';
	const affiliateCategory =
		await adminPlatinumListService.createAffiliateCategory(req);
	res.status(httpStatus.CREATED).send({ affiliateCategory });
});

const reorderAffiliateCategory = catchAsync(async (req, res) => {
	await adminPlatinumListService.reorder(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'successfull' });
});

const deleteAffiliateCategory = catchAsync(async (req, res) => {
	const affiliateCategory =
		await adminPlatinumListService.deleteAffiliateCategoryById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateAffiliateCategory = catchAsync(async (req, res) => {
	const { files } = req;
	req.body.folder = 'affiliateCategory';

	if (files?.image?.length > 0) {
		const image = await imageService.uploadImageToS3(req.files.image[0]);
		req.body.image = image;
	}
	const affiliateCategory =
		await adminPlatinumListService.updateAffiliateCategory(req);
	res.status(httpStatus.ACCEPTED).send({ affiliateCategory });
});

export default {
	getEvents,
	getAdminAffiliateCategories,
	getApiAffiliateCategories,
	addAffiliateCategory,
	updateAffiliateCategory,
	deleteAffiliateCategory,
	getApiAffiliateAreas,
	getEventsByEventType,
	reorderAffiliateCategory,
};
