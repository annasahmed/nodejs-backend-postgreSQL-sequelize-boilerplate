import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
const {
	imageService,
	adminHomeService,
	apiHomeService,
} from '../services'

const getSlides = catchAsync(async (req, res) => {
	const slides = await apiHomeService.getSlides(req);
	res.send({ data: slides });
});
const getMonthlyDeals = catchAsync(async (req, res) => {
	const monthlyDeals = await apiHomeService.getMonthdealsHome(req);
	res.send({ monthlyDeals });
});
const getSlidesByType = catchAsync(async (req, res) => {
	const slides = await adminHomeService.getSlidesByType(req);
	res.send({ slides });
});

const addSlide = catchAsync(async (req, res) => {
	const image =
		req?.files.image &&
		(await imageService.uploadImageToS3(req?.files?.image[0], 'home'));
	req.body.image = image || '';
	const slide = await adminHomeService.createSlide(req);
	res.status(httpStatus.CREATED).send({ slide });
});
const deleteSlide = catchAsync(async (req, res) => {
	const slide = await adminHomeService.deleteSlideById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateSlide = catchAsync(async (req, res) => {
	const { files } = req;

	if (files?.image?.length > 0) {
		const image = await imageService.uploadImageToS3(
			req.files.image[0],
			'home',
		);
		req.body.image = image;
	}
	const slide = await adminHomeService.updateSlide(req);
	res.status(httpStatus.ACCEPTED).send({ slide });
});
export default {
	getSlides,
	deleteSlide,
	updateSlide,
	addSlide,
	getSlidesByType,
	getMonthlyDeals,
};
