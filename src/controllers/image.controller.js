const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const {
	adminUspService,
	imageService,
	adminPlaceService,
} = require('../services');
const { getOffset } = require('../utils/query');

const addImage = catchAsync(async (req, res) => {
	const image = await imageService.uploadImageToS3(req);
	res.status(httpStatus.CREATED).send({ image });
});
const pp = catchAsync(async (req, res) => {
	const image = await imageService.deleteImageFromS3(req);
	res.status(httpStatus.ACCEPTED).send({ image });
});
const moveImage = catchAsync(async (req, res) => {
	const image = await imageService.copyImageToDestination(req, res);
	res.status(httpStatus.ACCEPTED).send({ image });
});
const resizeImage = catchAsync(async (req, res) => {
	const places = await adminPlaceService.getPlaceLogos(req);
	const successImages = [];
	const errorImages = [];

	for (const image of places) {
		if (image) {
			try {
				// resImages.push(
				const sucess = await imageService.resizeAndUploadImage(
					image.slice(1),
				);
				successImages.push(sucess);
				// );
			} catch (error) {
				errorImages.push({ image, id: image.split('/')[2] });
			}
		}
	}
	res.status(httpStatus.ACCEPTED).send({ successImages, errorImages });
});

module.exports = {
	addImage,
	moveImage,
	resizeImage,
};
