import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';

import {
	adminPlaceService,
	imageService,
	apiPlaceService,
	adminInvoiceService,
	vendorService,
	vendorInvoiceService,
} from '../services/index.js';

import {
	dealRedemptionService,
	adminPlaceService as adminadminPlaceService,
	placeService,
	stripeService,
} from '../services/Admin/index.js';

import {
	updatePlaceHappeningById,
	getPlacesHappenings,
	deletePlaceHappeningById,
	updatePlaceHappeningStatusById,
	createHappeningByPlaceId,
} from '../services/place/admin/happening.service.js';

// both
const getPlaceById = catchAsync(async (req, res) => {
	const clientIdCms = req.headers['clientid'] === 'cms';
	let place;
	switch (req.headers['clientid']) {
		case 'cms':
			place = await adminPlaceService.getPlaceById(
				req.params.placeId,
				req,
			);
			break;
		case 'vendor':
			place = await vendorService.getVendorById(req.params.placeId, req);
			break;
		default:
			place = await apiPlaceService.getPlaceById(req.params.placeId, req);
	}
	res.send({ place });
});

const getPlaces = catchAsync(async (req, res) => {
	const clientId = req.headers['clientid'] === 'cms';

	const places = clientId
		? await adminPlaceService.getPlaces(req)
		: await apiPlaceService.getPlaces(req);

	res.send({ places });
});

// api
const getFilteredPlaces = catchAsync(async (req, res) => {
	const places = await apiPlaceService.getFilteredPlaces(req);
	res.send({ places });
});

// admin
const addPlace = catchAsync(async (req, res) => {
	const lastPlace = await adminPlaceService.getLastPlace();
	req.body.id = lastPlace.id + 1;
	let importImages = false;
	const imagesChk = [];
	if (req.headers['noimages'] && req.body.logo) {
		req.body.logo = JSON.parse(req.body.logo);
		req.body.logo[0] = `/place/${lastPlace.id + 1}/${req.body.logo[0]}`;
		if (req.body.featured) {
			req.body.featured = JSON.parse(req.body.featured);
			req.body.featured = req.body.featured?.map((v) => {
				return `/place/${lastPlace.id + 1}/${v}`;
			});
		}
	} else if (req.headers['import'] && req.body.logo) {
		importImages = true;
		req.body.logo = JSON.parse(req.body.logo);
		req.body.logo[0] = `/place/${lastPlace.id + 1}/${req.body.logo[0]}`;
		if (req.body.featured) {
			req.body.featured = JSON.parse(req.body.featured);
			req.body.featured = await Promise.all(
				req.body.featured?.map((v) => {
					return `/place/${lastPlace.id + 1}/${v}`;
				}),
			);
		}
	} else {
		if (req.files?.logo?.length > 0) {
			const logo = await Promise.all(
				req.files.logo.map(async (image) => {
					return await imageService.uploadImageToS3(
						image,
						`/place/${lastPlace.id + 1}`,
					);
				}),
			);
			req.body.logo = logo;
		}
		if (req.files?.featured?.length > 0) {
			const featured = await Promise.all(
				req.files.featured.map(async (image) => {
					return await imageService.uploadImageToS3(
						image,
						`/place/${lastPlace.id + 1}`,
					);
				}),
			);

			req.body.featured = featured;
		}
		if (req.files?.reel?.length > 0) {
			const reel = await Promise.all(
				req.files.reel.map(async (image) => {
					return await imageService.uploadImageToS3(
						image,
						`/place/${lastPlace.id + 1}`,
					);
				}),
			);

			req.body.reel = reel;
		}
		if (req.files?.menuFile?.length > 0) {
			const menu = await Promise.all(
				req.files.menuFile.map(async (file) => {
					return await imageService.uploadImageToS3(
						file,
						`/place/${lastPlace.id + 1}`,
					);
				}),
			);
			req.body.menu = menu;
		}
	}

	const place = await adminPlaceService.createPlace(req);
	// if (importImages) {
	// 	// req.body.logo = JSON.parse(req.body.logo);
	// 	// req.body.featured = JSON.parse(req.body.featured);
	// 	await imageService.copyImageToDestination(
	// 		`https://demo-images-d3.s3.me-central-1.amazonaws.com/${req.body.slug}/${req.body.logo[0]}`,
	// 		`https://dubaidailydeals-dev.s3.me-central-1.amazonaws.com/place/${lastPlace.id + 1}/${req.body.logo[0]}`,
	// 	);
	// 	await Promise.all(
	// 		req.body.featured?.map(async (v) => {
	// 			await imageService.copyImageToDestination(
	// 				`https://demo-images-d3.s3.me-central-1.amazonaws.com/${req.body.slug}/${v}`,
	// 				`https://dubaidailydeals-dev.s3.me-central-1.amazonaws.com/place/${lastPlace.id + 1}/${v}`,
	// 			);
	// 		}),
	// 	);
	// }
	res.status(httpStatus.CREATED).send({ place });
});

const createPlaceByPhone = catchAsync(async (req, res) => {
	const place = await adminPlaceService.createPlaceByPhone(req);
	res.send({ place });
});

const deletePlace = catchAsync(async (req, res) => {
	const place = await adminPlaceService.deletePlaceById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});

const updateRatingsAndReviews = catchAsync(async (req, res) => {
	const place = await adminPlaceService.updateRatingsAndReviews(req);
	res.status(httpStatus.ACCEPTED).send({
		message: 'successful',
		place,
	});
});
// updatePlaceTiming using google maps api
const updatePlaceTiming = catchAsync(async (req, res) => {
	const place = await adminPlaceService.updatePlaceTiming(req);
	res.status(httpStatus.ACCEPTED).send({
		message: 'successful',
		place,
	});
});

const updatePlaceByTitle = catchAsync(async (req, res) => {
	const place = await adminPlaceService.updatePlaceByTitle(req);
	res.status(httpStatus.ACCEPTED).send({
		place,
	});
});

const updatePlace = catchAsync(async (req, res) => {
	const id = req.params.placeId || req.body.id;
	if (req.files?.logo?.length > 0) {
		const logo = await Promise.all(
			req.files.logo.map(async (image) => {
				return await imageService.uploadImageToS3(image, `place/${id}`);
			}),
		);
		req.body.logo = logo;
	}
	if (req.files?.featured?.length > 0) {
		const featured = await Promise.all(
			req.files.featured.map(async (image) => {
				return await imageService.uploadImageToS3(image, `place/${id}`);
			}),
		);
		req.body.featured = featured;
	}
	if (req.body.updatedFeatured && req.body.updatedFeatured > 0) {
		req.body.featured = [
			...featured,
			...JSON.parse(req.body.updatedFeatured),
		];
	}
	if (req.files?.reel?.length > 0) {
		const reel = await Promise.all(
			req.files.reel.map(async (image) => {
				return await imageService.uploadImageToS3(image, `place/${id}`);
			}),
		);
		req.body.reel = reel;
	}
	if (req.files?.menuFile?.length > 0) {
		const menu = await imageService.uploadImageToS3(
			req.files.menuFile[0],
			`place/${id}`,
		);

		req.body.menu = menu;
	}

	const place = await adminPlaceService.updatePlace(req);
	res.status(httpStatus.ACCEPTED).send({ place });
});

const associatePlace = catchAsync(async (req, res) => {
	const place = await adminPlaceService.associatePlace(req);
	res.status(httpStatus.CREATED).send({ place });
});

const getRedemptions = catchAsync(async (req, res) => {
	const redemptions = await dealRedemptionService.getRedemptions(req);
	const place = await adminadminPlaceService.getPlaceById(req, [
		'title',
		'id',
	]);
	res.send({ redemptions, place });
});

const getPlacesTitle = catchAsync(async (req, res) => {
	const places = await adminPlaceService.getPlacesTitle(req);
	res.send({ places });
});
const sendWelcomeEmailVendor = catchAsync(async (req, res) => {
	await adminPlaceService.sendWelcomeAndCredentialEmailVendor(req);
	res.send({ email: 'Email sent successfully' });
});

// to delete
const deleteTiming = catchAsync(async (req, res) => {
	const timing = await adminPlaceService.deleteTiming(req);
	res.status(httpStatus.ACCEPTED).send({
		message: 'day deleted successfully',
	});
});
const updateImagesBySlug = catchAsync(async (req, res) => {
	const place = await placeService.updateImagesBySlug(req);
	res.status(httpStatus.ACCEPTED).send({
		place,
	});
});
const updatePlaceByByIdImport = catchAsync(async (req, res) => {
	const place = await placeService.updatePlaceByByIdImport(req);
	res.status(httpStatus.ACCEPTED).send({
		place,
	});
});
const getTimings = catchAsync(async (req, res) => {
	const timings = await adminPlaceService.getTimings(req);
	res.send({ timings });
});
const updateMedia = catchAsync(async (req, res) => {
	const media = await adminPlaceService.updateMedia(req);
	res.status(httpStatus.ACCEPTED).send({
		media,
	});
});
const reorderMedia = catchAsync(async (req, res) => {
	const media = await adminPlaceService.reorderMedia(req);
	res.status(httpStatus.ACCEPTED).send({
		media,
	});
});
const createPlaceToCategory = catchAsync(async (req, res) => {
	const media = await adminPlaceService.createPlaceToCategoryImport(req);
	res.status(httpStatus.CREATED).send({
		media,
	});
});
const requestEditVendor = catchAsync(async (req, res) => {
	await vendorService.requestEdit(req);
	res.status(httpStatus.ACCEPTED).send({
		success: true,
		message: 'Request edit email sent',
	});
});

// only admin

const getPlaceHappening = catchAsync(async (req, res) => {
	const places = await getPlacesHappenings(req);
	res.status(httpStatus.ACCEPTED).send({
		places,
	});
});
const updatePlaceHappening = catchAsync(async (req, res) => {
	const happening = await updatePlaceHappeningById(req);
	res.status(httpStatus.ACCEPTED).send({
		happening,
	});
});
const updatePlaceHappeningStatus = catchAsync(async (req, res) => {
	const happening = await updatePlaceHappeningStatusById(req);
	res.status(httpStatus.ACCEPTED).send({
		happening,
	});
});
const deletePlaceHappening = catchAsync(async (req, res) => {
	await deletePlaceHappeningById(req);
	res.status(httpStatus.ACCEPTED).send({
		message: 'Happening deleted successfully',
	});
});
const createPlaceHappening = catchAsync(async (req, res) => {
	await createHappeningByPlaceId(req);
	res.status(httpStatus.ACCEPTED).send({
		message: 'Happening deleted successfully',
	});
});

export default {
	getPlaces,
	deletePlace,
	updatePlace,
	addPlace,
	getPlaceById,
	getFilteredPlaces,
	deleteTiming,
	getTimings,
	updateImagesBySlug,
	updateMedia,
	updatePlaceByTitle,
	getRedemptions,
	getPlacesTitle,
	//
	updatePlaceByByIdImport,
	updateRatingsAndReviews,

	updatePlaceTiming,
	createPlaceByPhone,
	createPlaceToCategory,
	requestEditVendor,

	reorderMedia,
	sendWelcomeEmailVendor,

	associatePlace,

	//
	updatePlaceHappening,
	getPlaceHappening,
	deletePlaceHappening,
	updatePlaceHappeningStatus,
	createPlaceHappening,
};
