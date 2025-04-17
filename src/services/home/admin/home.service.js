const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;
const {
	userService,
	adminEmirateService,
	adminAreaService,
	adminPlaceService,
} = require('../../index.js');
const { refactorCode, nearByCondition } = require('../../../utils/globals.js');
const { getDealsWithoutCount, getDeals } = require('../../deal/admin/deal.service.js');
const { getMonthlyDealsWithoutCount } = require('../../monthlyDeal/admin/monthly_deal.service.js');

// async function getSlideByTitle(name) {
// 	const slide = await db.home.findOne({
// 		where: { name },
// 	});

// 	return slide;
// }
async function createSlide(req) {
	const { title, type, placeId, image, link, userId, status } = req.body;

	// const slide = await getSlideByTitle(title);

	// if (slide) {
	// 	throw new ApiError(httpStatus.CONFLICT, 'This Slide already exits');
	// }

	// const place = await adminPlaceService.getPlaceById(placeId);

	// if (!place) {
	// 	throw new ApiError(httpStatus.NOT_FOUND, 'place not found');
	// }

	const user = await userService.getUserById(userId);

	if (!user) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	const createdSlide = await db.home
		.create({
			title,
			image,
			type,
			link,
			place_id: placeId,
			user_id: userId,
			status,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdSlide;
}

async function getSlides(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = 10 } = req.query;
	// req.query.limit=10
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);
	const locationCondition = nearByCondition(
		latitude || 25.10014531,
		longitude || 55.133278,
	);

	const offset = getOffset(page, limit);

	const slides = await db.home.findAll({
		include: [
			{
				model: db.place,
				require: true,
				attributes: ['id', 'title'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'image',
			'link',
			'status',
			'type',
			'created_date_time',
			'modified_date_time',
		],
		// group: ['id', 'type'],
		offset,
		limit,
		raw: false,
		// group: ['user.id', 'place.id', 'type', 'title'],
	});
	let sliders = [];
	let banners = [];

	// Iterate through slides and categorize them
	slides.forEach((slide) => {
		if (slide.type === 'slider') {
			sliders.push(slide);
		} else if (slide.type === 'banner') {
			banners.push(slide);
		}
	});

	const nearByPlaces = await adminPlaceService.getPlaces(req);
	const newDeals = await getDeals(req);
	const monthlyDeals = await getMonthlyDealsWithoutCount(req);

	// Construct the desired response format
	const formattedResponse = {
		// data: {
		slides: sliders,
		banners,
		nearByPlaces,
		newDeals,
		monthlyDeals,
		// },
	};
	// refactorCode(slides, [
	// 	{
	// 		title: 'place',
	// 		items: ['id', 'title'],
	// 	},
	// 	{
	// 		title: 'user',
	// 		items: ['id', 'first_name', 'last_name'],
	// 	},
	// ]);

	return formattedResponse;
}
async function getSlidesByType(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const slides = await db.home.findAndCountAll({
		where: { type: req.params.type || req.body.id },
		include: [
			{
				model: db.place,
				require: true,
				attributes: ['id', 'title'],
			},
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'image',
			'link',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});

	refactorCode(slides, [
		{
			title: 'place',
			items: ['id', 'title'],
		},
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	return slides;
}

async function deleteSlideById(req) {
	const deletedSlide = await db.home.destroy({
		where: { id: req.params.slideId || req.body.id },
	});

	if (!deletedSlide) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Slide not found');
	}

	return deletedSlide;
}

async function updateSlide(req) {
	const { name, userId, placeId } = req.body;

	// if (name) {
	// 	const Slide = await getSlideByName(name);

	// 	if (Slide) {
	// 		throw new ApiError(httpStatus.CONFLICT, 'This Slide already exits');
	// 	}
	// }
	// if (placeId) {
	// 	const place = await adminPlaceService.getPlaceById(placeId);

	// 	if (!place) {
	// 		throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
	// 	}
	// }
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedSlide = await db.home
		.update(
			{ ...req.body },
			{
				where: { id: req.params.slideId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedSlide;
}

module.exports = {
	getSlides,
	createSlide,
	deleteSlideById,
	updateSlide,
	getSlidesByType,
};
