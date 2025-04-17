const httpStatus = require('http-status');
const { getOffset } = require('../../../utils/query.js');
const ApiError = require('../../../utils/ApiError.js');
const { encryptData } = require('../../../utils/auth.js');
const config = require('../../../config/config.js');
const db = require('../../../db/models/index.js').default;

const apiPlaceService = require('../../place/api/place.service');
const apiDealService = require('../../deal/api/deal.service');
const apiMonthlyDealService = require('../../monthlyDeal/api/monthly_deal.service');
const {
	refactorCode,
	nearByCondition,
	checkDeletedCondition,
	convert24to12,
} = require('../../../utils/globals.js');

function getRandomObjects(array, count = 8) {
	const shuffledArray = array.sort(() => 0.5 - Math.random());
	return shuffledArray.slice(0, count);
}
const daysOfWeek = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

const getRandomPlacesSlides = async () => {
	const randomPlaces = await db.place.findAll({
		where: { trending: true, status: true, ...checkDeletedCondition },
		attributes: ['id', 'title'],
		order: db.Sequelize.literal('RANDOM()'), // Fetch random records
		limit: 8, // Limit to 8 records
		include: [
			{
				model: db.timing,
				required: false,
				attributes: ['day', 'opening', 'closing'],
			},
			{
				model: db.media,
				required: true,
				attributes: ['logo', 'featured'],
			},
			{
				model: db.media,
				required: true,
				attributes: ['logo', 'featured'],
			},
			{
				model: db.happening_badge,
				required: false,
				attributes: ['title'],
			},
			{
				model: db.deal, // Include deals through place_to_deal
				required: false,
				attributes: ['id', 'title'],
				through: { attributes: [] }, // Exclude place_to_deal from results
				include: {
					model: db.parent_deal,
					required: true,
					attributes: ['id', 'image', 'type', 'discount', 'title'],
				},
			},
		],
	});
	const finalPlaces = [];
	for (const place of randomPlaces) {
		const plainPlace = place.get({ plain: true });
		plainPlace.timings = plainPlace.timings?.reduce((acc, timing) => {
			if (timing?.opening !== null || timing?.closing !== null) {
				const newTiming = {
					...timing,
					opening: timing?.opening
						? convert24to12(timing.opening)
						: timing?.opening,
					closing: timing?.closing
						? convert24to12(timing.closing)
						: timing?.closing,
				};
				acc.push(newTiming);
			}
			return acc;
		}, []);
		const today = new Date();

		const currentDay = daysOfWeek[today.getDay()];
		const todayTime = plainPlace.timings?.filter(
			(v) => v.day === currentDay.toLowerCase() || 'daily',
		)[0];

		if (todayTime) {
			if (
				todayTime?.opening === '00:00' &&
				todayTime?.closing === '23:59'
			) {
				plainPlace.displayTime = 'Open 24 hours';
			} else {
				if (todayTime?.closing) {
					plainPlace.displayTime = `Open until ${todayTime?.closing}`;
				} else {
					plainPlace.displayTime = 'Open 24 hours';
				}
			}
		} else {
			plainPlace.displayTime = 'Closed';
		}
		finalPlaces.push(plainPlace);
	}

	return finalPlaces;
};

async function getSlides(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = 10 } = req.query;
	// req.query.limit=10
	// const latitude = parseFloat(req.headers['latitude']);
	// const longitude = parseFloat(req.headers['longitude']);
	// const locationCondition = nearByCondition(latitude, longitude);

	const offset = getOffset(page, limit);

	const sliders = await db.home.findAll({
		where: {
			type: 'slider',
			status: true,
		},
		// include: [
		// 	{
		// 		model: db.place,
		// 		require: true,
		// 		attributes: ['id', 'title'],
		// 	},
		// ],
		attributes: ['id', 'title', 'image', 'link'],
		offset,
		limit,
		raw: false,
	});
	const banner = await db.home.findOne({
		where: {
			type: 'slider',
			status: true,
		},
		attributes: ['id', 'title', 'image', 'link'],
		raw: true,
	});

	const randomSlides = await getRandomPlacesSlides();

	const nearByPlaces = await apiPlaceService.getNearByPlaces(req);
	// const newDeals = await apiDealService.getDeals(req);
	const monthlyDeals =
		await apiMonthlyDealService.getHomepageMonthlyDealsDelete(req);
	const formattedResponse = {
		slides: sliders, //delete it
		homeSlides: [banner, ...randomSlides],
		// banners,
		nearByPlaces,
		// newDeals,
		monthlyDeals, //delete it
	};

	return formattedResponse;
}

async function getMonthdealsHome(req) {
	const monthlyDeals =
		await apiMonthlyDealService.getHomepageMonthlyDeals(req);
	return monthlyDeals;
}

module.exports = {
	getSlides,
	getMonthdealsHome,
};
