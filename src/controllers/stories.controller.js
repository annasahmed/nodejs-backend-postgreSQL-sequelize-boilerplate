const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const {
	adminStoriesService,
	imageService,
	apiStoriesService,
} = require('../services');

const getStories = catchAsync(async (req, res) => {
	const clientId = req.headers['clientid'] === 'cms';
	const stories = clientId
		? await adminStoriesService.getStories(req)
		: await apiStoriesService.getStories(req);
	res.send({ stories });
});
const reorderStories = catchAsync(async (req, res) => {
	await adminStoriesService.reorder(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'successfull' });
});

const addStory = catchAsync(async (req, res) => {
	console.log(req.files, 'chkk stories controller');

	if (req.files?.logo?.length > 0) {
		const logo = await Promise.all(
			req.files.logo.map(async (image) => {
				return await imageService.uploadImageToS3(image, 'story');
			}),
		);
		req.body.logo = await logo[0];
	}
	if (req.files?.featured?.length > 0) {
		const featured = await Promise.all(
			req.files.featured.map(async (image) => {
				return await imageService.uploadImageToS3(image, 'story');
			}),
		);

		req.body.featured = await featured;
	}
	if (req.files?.videos?.length > 0) {
		const reel = await Promise.all(
			req.files.videos.map(async (image) => {
				return await imageService.uploadImageToS3(image, 'story');
			}),
		);

		req.body.videos = await reel;
	}
	console.log(req.body, 'req.body chkk stories controller');

	// const story = await adminStoriesService.createStory(req);
	res.status(httpStatus.CREATED).send({ story });
});

const deleteStory = catchAsync(async (req, res) => {
	const story = await adminStoriesService.deleteStoryById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateStory = catchAsync(async (req, res) => {
	console.log(req.files, 'chkk update stories controller');
	if (req.files?.logo?.length > 0) {
		const logo = await Promise.all(
			req.files.logo.map(async (image) => {
				return await imageService.uploadImageToS3(image, 'story');
			}),
		);
		req.body.logo = logo[0];
	}
	if (req.files?.featured?.length > 0) {
		const featured = await Promise.all(
			req.files.featured.map(async (image) => {
				return await imageService.uploadImageToS3(image, 'story');
			}),
		);

		req.body.featured = featured;
	}
	if (req.files?.videos?.length > 0) {
		const reel = await Promise.all(
			req.files.videos.map(async (image) => {
				return await imageService.uploadImageToS3(image, 'story');
			}),
		);

		req.body.videos = reel;
	}
	console.log(req.files, 'chkk update stories controller');
	const story = await adminStoriesService.updateStory(req);
	res.status(httpStatus.ACCEPTED).send({ story });
});
module.exports = {
	getStories,
	deleteStory,
	updateStory,
	addStory,
	reorderStories,
};
