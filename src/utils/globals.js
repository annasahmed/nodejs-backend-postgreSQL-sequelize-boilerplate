import ApiError from './ApiError';
import httpStatus from 'http-status'
import { verifyToken } from './auth';

const getMultipleincludes = async (arr, dbArray) => {
	for (const item of arr.rows) {
		for (const database of dbArray) {
			item.areas = await db[database.db].findAll({
				where: { database_id: id },
				attributes: ['id', 'name'],
				raw: true,
			});
		}
		// await Promise.all(
		// 	(item.areas = await db.area.findAll({
		// 		where: { item_id: item.id },
		// 		attributes: ['id', 'name'],
		// 		raw: true,
		// 	})),
		// 	(item.neighbourhoods = await db.neighbourhood.findAll({
		// 		where: { item_id: item.id },
		// 		attributes: ['id', 'name'],
		// 		raw: true,
		// 	})),
		// );
	}
};
function findCommonElements(arrays) {
	const validArrays = arrays.filter(
		(arr) => arr !== undefined && arr !== null,
	);
	if (validArrays.length === 0) {
		return [];
	}
	return validArrays.reduce((acc, curr) => {
		curr.forEach((element) => {
			if (
				acc.indexOf(element) === -1 &&
				validArrays.every((arr) => arr.includes(element))
			) {
				acc.push(element);
			}
		});
		return acc;
	}, []);
}
// const db = require('../db/models');
import db from '../db/models'
const { Op, where } = require('sequelize');
const Sequelize = require('sequelize');

const searchIds = (id) => {
	return id
		? {
			[Op.or]: [
				{
					id: parseInt(id) || null,
				},
			],
		}
		: {};
};

const checkDeletedCondition = {
	[Op.or]: [{ deleted_at: null }, { deleted_by: null }],
	// [Op.and]: [{ deleted_at: null }, { deleted_by: null }],
};

const softDelete = async (req, model, id) => {
	const { userId } = await verifyToken(req.headers.authorization);
	const deletedUsp = await db[model].update(
		{ deleted_by: userId, deleted_at: new Date() },
		{
			where: { id },
			returning: true,
			plain: true,
			raw: true,
		},
	);
	if (!deletedUsp) {
		throw new ApiError(httpStatus.NOT_FOUND, `${model} not found`);
	}
};

const searchManytoMany = async (
	uspId,
	usp_id,
	database,
	attributes = false,
) => {
	let whereCondition = {};
	if (uspId && uspId.length > 0) {
		let placeIdsWithUsps;
		if (typeof uspId === 'object') {
			let arr = uspId.filter((value, index, self) => {
				return self.indexOf(value) === index;
			});
			uspId = [...arr];
			placeIdsWithUsps = await db[database].findAll({
				// where: { [usp_id]: { [Sequelize.Op.in]: uspId } },
				// where: { [usp_id]: [6,8] },
				where: { [usp_id]: uspId },
				attributes: attributes ? attributes : ['place_id'],
				// group: ['place_id'], // Group by place_id to ensure each place is counted once
				// having: Sequelize.literal(
				// 	`COUNT(DISTINCT ${usp_id}) = ${uspId.length}`,
				// ),
				raw: true,
			});
		} else {
			placeIdsWithUsps = await db[database].findAll({
				where: { [usp_id]: uspId },
				attributes: attributes ? attributes : ['place_id'],
				raw: true,
			});
		}
		// Extract the placeIds from the result
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);
		whereCondition.id = placeIds;
		if (attributes) {
			const placeDays = placeIdsWithUsps.map((place) => place.days);
			whereCondition.days = placeDays;
		}
	}

	return whereCondition;
};
const searchManytoManyDaysFilters = async (
	uspId,
	usp_id,
	database,
	multiple = false,
) => {
	let whereCondition = {};
	if (uspId && uspId.length > 0) {
		let placeIdsWithUsps;
		if (typeof uspId === 'object') {
			let arr = uspId.filter((value, index, self) => {
				return self.indexOf(value) === index;
			});
			uspId = [...arr];
			placeIdsWithUsps = await db[database].findAll({
				// where: { [usp_id]: { [Sequelize.Op.in]: uspId } },
				// where: { [usp_id]: [6,8] },
				where: {
					[Op.or]: [
						{ [usp_id]: uspId },
						{ [usp_id]: 'daily' },
						{ [usp_id]: { [Op.is]: null } },
					],
				},
				attributes: ['place_id'],
				// group: ['place_id'], // Group by place_id to ensure each place is counted once
				// having: Sequelize.literal(
				// 	`COUNT(DISTINCT ${usp_id}) = ${uspId.length}`,
				// ),
				raw: true,
			});
		} else {
			placeIdsWithUsps = await db[database].findAll({
				// where: { [usp_id]: uspId },

				where: {
					[Op.or]: [
						{ [usp_id]: uspId },
						{ [usp_id]: 'daily' },
						{ [usp_id]: { [Op.is]: null } },
					],
				},
				attributes: ['place_id'],
				raw: true,
			});
		}
		// Extract the placeIds from the result
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);

		whereCondition.id = placeIds;
	}

	return whereCondition;
};
// uspId,
// 	usp_id,
// 	database,
// 	multiple = false,
const searchManytoManyDays = async (uspId, usp_id, database, categoryId) => {
	let whereCondition = {};
	if (uspId && uspId.length > 0 && typeof uspId[0] === 'object') {
		uspId = uspId[0]?.map((v) => {
			return [v];
		});
		// uspId = [...new Set(uspId)];
		const dayConditions = uspId.map((day) => ({
			[Op.and]: [
				{
					[Op.or]: [
						{
							[usp_id]: {
								[Op.contains]: [day],
							},
						},
						{
							[usp_id]: {
								[Op.contains]: ['daily'],
							},
						},
						{
							[usp_id]: {
								[Op.eq]: [],
							},
						},
						{
							[usp_id]: {
								[Op.eq]: null,
							},
						},
					],
				},
				{
					sub_category_id: categoryId,
				},
			],
		}));

		const placeIdsWithUsps = await db[database].findAll({
			where: {
				[Op.or]: dayConditions,
			},
			attributes: ['place_id'],
			group: ['place_id'],
			raw: true,
		});
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);

		if (placeIds.length > 0) {
			whereCondition.id = placeIds;
		}
	} else if (uspId && uspId.length > 0) {
		const placeIdsWithUsps = await db[database].findAll({
			where: {
				[Op.and]: [
					{
						[Op.or]: [
							{
								[usp_id]: {
									[Op.contains]: [uspId],
								},
							},
							{
								[usp_id]: {
									[Op.contains]: ['daily'],
								},
							},
							{
								[usp_id]: {
									[Op.eq]: [],
								},
							},
						],
					},
					{
						sub_category_id: categoryId,
					},
				],
			},
			attributes: ['place_id'],
			group: ['place_id'],
			having: Sequelize.literal(
				`COUNT(DISTINCT ${usp_id}) = ${uspId.length}`,
			),
			raw: true,
		});
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);

		if (placeIds.length > 0) {
			whereCondition.id = placeIds;
		}
	}

	return whereCondition;
};
const searchManytoManyDaysArrNew = async (
	uspId,
	usp_id,
	database,
	categoryId,
) => {
	let whereCondition = [];

	if (uspId && uspId.length > 0 && typeof uspId[0] === 'object') {
		uspId = uspId[0]?.map((v) => {
			return [v];
		});
		// uspId = [...new Set(uspId)];
		const dayConditions = uspId.map((day) => ({
			[usp_id]: {
				[Sequelize.Op.contains]: [day],
			},
			sub_category_id: categoryId,
		}));

		// uspId = ['monday'];
		// const cond = [
		// 	{
		// 		[usp_id]: {
		// 			[Sequelize.Op.contains]: [['monday']],
		// 		},
		// 	},
		// 	{
		// 		[usp_id]: {
		// 			[Sequelize.Op.contains]: [['sunday']],
		// 		},
		// 	},
		// ];

		const placeIdsWithUsps = await db[database].findAll({
			// where: {
			// 	[usp_id]: {
			// 		[Sequelize.Op.contains]: [uspId],
			// 	},
			// },
			where: {
				[Op.or]: dayConditions,
			},
			attributes: ['place_id'],
			group: ['place_id'], // Group by place_id to ensure each place is counted once
			// having: Sequelize.literal(
			// 	`COUNT(DISTINCT ${usp_id}) = ${uspId.length}`,
			// ),
			raw: true,
		});
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);

		if (placeIds.length > 0) {
			whereCondition = [...placeIds];
		}
	} else if (uspId && uspId.length > 0) {
		// uspId = [...new Set(uspId)];
		const placeIdsWithUsps = await db[database].findAll({
			where: {
				[Op.and]: [
					{
						[usp_id]: {
							[Sequelize.Op.contains]: [uspId],
						},
						sub_category_id: categoryId,
					},
				],
			},
			attributes: ['place_id'],
			group: ['place_id'], // Group by place_id to ensure each place is counted once
			having: Sequelize.literal(
				`COUNT(DISTINCT ${usp_id}) = ${uspId.length}`,
			),
			raw: true,
		});
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);

		if (placeIds.length > 0) {
			whereCondition = [...placeIds];
		}
	}

	return whereCondition;
};
const searchManytoManyArray = async (uspId, usp_id, database) => {
	let whereCondition = [];

	if (uspId && uspId.length > 0) {
		let placeIdsWithUsps;
		if (typeof uspId === 'object') {
			let arr = uspId.filter((value, index, self) => {
				return self.indexOf(value) === index;
			});
			uspId = [...arr];
			placeIdsWithUsps = await db[database].findAll({
				where: { [usp_id]: { [Sequelize.Op.in]: uspId } },
				attributes: ['place_id'],
				group: ['place_id'], // Group by place_id to ensure each place is counted once
				having: Sequelize.literal(
					`COUNT(DISTINCT ${usp_id}) = ${uspId.length}`,
				),
				raw: true,
			});
		} else {
			placeIdsWithUsps = await db[database].findAll({
				where: { [usp_id]: uspId },
				attributes: ['place_id'],
				raw: true,
			});
		}
		// Extract the placeIds from the result
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);

		whereCondition = [...placeIds];
	}

	return whereCondition;
};
const searchManytoManyTitle = async (uspId, usp_id, database) => {
	let whereCondition = [];

	if (uspId && uspId.length > 0) {
		let placeIdsWithUsps;
		const searchCondition = uspId
			? {
				[Op.or]: [
					{
						[usp_id]: { [Op.iLike]: `%${uspId}%` },
					},
				],
			}
			: {};

		placeIdsWithUsps = await db[database].findAll({
			where: { ...searchCondition },
			attributes: ['place_id'],
			raw: true,
		});

		// Extract the placeIds from the result
		const placeIds = placeIdsWithUsps.map((place) => place.place_id);
		whereCondition = [...placeIds];
	}
	// return searchCondition;
	return whereCondition;
};
const searchManytoManyTiming = async (timings, timing_id, database) => {
	let whereCondition = {};
	if (timings && timings.length > 0 && typeof timings === 'object') {
		let placeIdsWithTimings;

		// Construct an array to store the timing conditions
		const timingConditions = [];

		// Iterate through each timing specified in the query parameters
		for (const timing of timings) {
			const selectedTimingPool = getTimingPool(timing);
			if (selectedTimingPool) {
				const startTime = selectedTimingPool.opening;
				const endTime = selectedTimingPool.closing;

				// Construct the timing condition for this timing
				const timingCondition = {
					opening: { [Op.lte]: endTime },
					closing: { [Op.gte]: startTime },
				};

				timingConditions.push(timingCondition);
			}
		}
		// If there are multiple timing conditions, find places that match all conditions
		if (timingConditions.length > 0) {
			// Construct the final where condition using [Op.or] to match any of the timing conditions
			whereCondition = {
				[Op.or]: timingConditions,
			};

			placeIdsWithTimings = await db[database].findAll({
				where: whereCondition,
				attributes: ['place_id'],
				raw: true,
			});

			// Extract the place IDs from the result
			const placeIds = placeIdsWithTimings.map((place) => place.place_id);
			whereCondition = [...placeIds];
		}
	} else if (timings) {
		let placeIdsWithTimings;
		const selectedTimingPool = getTimingPool(timings);

		if (selectedTimingPool) {
			const startTime = selectedTimingPool.opening;
			const endTime = selectedTimingPool.closing;

			// Construct the search condition for timings
			const timingSearchCondition = {
				opening: { [Op.lte]: endTime },
				closing: { [Op.gte]: startTime },
			};

			placeIdsWithTimings = await db[database].findAll({
				where: timingSearchCondition,
				attributes: ['place_id'],
				raw: true,
			});

			// Extract the placeIds from the result
			const placeIds = placeIdsWithTimings.map((place) => place.place_id);
			whereCondition = [...placeIds];
		}
	}

	return whereCondition;
};

const getAssociatePlaces = async (id) => {
	const placeId = parseInt(id);

	const relatedPlaces = await db.place_to_place.findAll({
		where: {
			[Op.or]: [
				{ placeId: placeId },
				{
					relatedPlaceId: placeId,
				},
			],
		},
	});

	const relatedPlaceIds = relatedPlaces?.map((v) =>
		v.relatedPlaceId !== placeId ? v.relatedPlaceId : v.placeId,
	);
	const placesRelatedIds = [...relatedPlaceIds];
	for (const relPlace of relatedPlaceIds) {
		const relatedPlaces = await db.place_to_place.findAll({
			where: {
				[Op.or]: [
					{
						[Op.and]: [
							{
								placeId: relPlace,
								relatedPlaceId: { [Op.ne]: placeId },
							},
						],
					},
					{
						[Op.and]: [
							{
								relatedPlaceId: relPlace,
								placeId: { [Op.ne]: placeId },
							},
						],
					},
				],
			},
		});
		relatedPlaces?.forEach((v) => {
			if (v.relatedPlaceId !== relPlace) {
				placesRelatedIds.push(v.relatedPlaceId);
			} else {
				placesRelatedIds.push(v.placeId);
			}
		});
	}

	return [...new Set([...placesRelatedIds])];
};

const refactorCode = (arr, subItems) => {
	const finalArr = arr.rows || arr;

	if (typeof finalArr === 'object') {
		finalArr?.forEach((item) => {
			subItems.map((v) => {
				const obj = {};
				// if (!v.hide) {
				v.items.map((objItem) => {
					const objItem1 = item[`${v.title}.${objItem}`];
					obj[objItem || 'title'] = objItem1;
					delete item[`${v.title}.${objItem}`];
				});
				item[v.title] = { ...obj };
				// }
				// else{

				// }
				delete item[v.title + '_id'];
			});
		});
	}
};
function convert24to12(time24h) {
	// Extracting hours, minutes, and seconds
	var time = time24h.match(/^(\d{2}):(\d{2}):(\d{2})$/);
	if (!time) {
		return null; // Invalid format
	}
	var hours = parseInt(time[1], 10);
	var minutes = parseInt(time[2], 10);
	// var seconds = parseInt(time[3], 10);

	// Determining AM or PM period
	var period = hours >= 12 ? 'PM' : 'AM';

	// Adjusting hours for 12-hour format
	hours = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11

	// Formatting into 12-hour format
	var hours12 = ('0' + hours).slice(-2); // Add leading zero if needed
	var minutes12 = ('0' + minutes).slice(-2); // Add leading zero if needed
	// var seconds12 = ('0' + seconds).slice(-2); // Add leading zero if needed

	return hours12 + ':' + minutes12 + ' ' + period;
}

const nearByCondition = (latitude, longitude) => {
	const radius = 50; // 10 km radius
	const locationCondition = {};
	if (latitude && longitude) {
		locationCondition.latitude = {
			[Op.between]: [
				latitude - radius / 111.12,
				latitude + radius / 111.12,
			],
		};
		locationCondition.longitude = {
			[Op.between]: [
				longitude -
				radius / (111.12 * Math.cos((latitude * Math.PI) / 180)),
				longitude +
				radius / (111.12 * Math.cos((latitude * Math.PI) / 180)),
			],
		};
	}
	return locationCondition;
};
function toRadians(degrees) {
	return degrees * (Math.PI / 180);
}

const getDistance = (lat1, lon1, lat2, lon2) => {
	if (!lat1 || !lon1 || !lat2 || !lon2) {
		return null;
	}
	const R = 6371; // Earth's radius in kilometers
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
		Math.cos(toRadians(lat2)) *
		Math.sin(dLon / 2) *
		Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c;
	return distance.toFixed(2);
};
const timingPools = {
	morning: {
		opening: '07:00:00',
		closing: '11:59:00',
	},
	midDay: {
		opening: '12:00:00',
		closing: '15:59:00',
	},
	midAfternoon: {
		opening: '16:00:00',
		closing: '18:59:00',
	},
	evening: {
		opening: '19:00:00',
		closing: '24:00:00',
	},
};
function getTimingPool(timing) {
	switch (timing) {
		case 'morning':
			return timingPools.morning;
		case 'midDay':
			return timingPools.midDay;
		case 'midAfternoon':
			return timingPools.midAfternoon;
		case 'evening':
			return timingPools.evening;
		default:
			return null;
	}
}
function padId(id) {
	return id.toString().padStart(3, '0');
}

function numberToWords(num) {
	// Helper arrays for words
	const belowTwenty = [
		'zero',
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
		'ten',
		'eleven',
		'twelve',
		'thirteen',
		'fourteen',
		'fifteen',
		'sixteen',
		'seventeen',
		'eighteen',
		'nineteen',
	];

	const tens = [
		'',
		'',
		'twenty',
		'thirty',
		'forty',
		'fifty',
		'sixty',
		'seventy',
		'eighty',
		'ninety',
	];

	const thousands = ['', 'thousand', 'million', 'billion', 'trillion'];

	// Convert integer part to words
	function helper(n) {
		if (n === 0) return '';
		else if (n < 20) return belowTwenty[n] + ' ';
		else if (n < 100)
			return tens[Math.floor(n / 10)] + ' ' + helper(n % 10);
		else
			return (
				belowTwenty[Math.floor(n / 100)] + ' hundred ' + helper(n % 100)
			);
	}

	// Handle integer and decimal parts separately
	function numberToCurrencyWords(num) {
		let dirhams = Math.floor(num); // Integer part (dirhams)
		let fils = Math.round((num - dirhams) * 100); // Decimal part (fils)

		let word = '';
		let thousandIndex = 0;

		// Convert the integer (dirhams) part
		while (dirhams > 0) {
			if (dirhams % 1000 !== 0) {
				word =
					helper(dirhams % 1000) +
					thousands[thousandIndex] +
					' ' +
					word;
			}
			dirhams = Math.floor(dirhams / 1000);
			thousandIndex++;
		}

		// Handle the case where num is 0
		let dirhamPart = word.trim() ? word.trim() : 'zero';

		// Convert the decimal (fils) part
		let filsPart = fils > 0 ? helper(fils).trim() : 'zero';

		return `DIRHAMS ${dirhamPart.toUpperCase()} AND ${filsPart.toUpperCase()} FILLS`.trim();
	}

	return numberToCurrencyWords(num);
}

const axios = require('axios');
const { object } = require('@hapi/joi');

async function getGoogleRating(lat, lng, phone) {
	if (phone) {
		const apiKey = 'AIzaSyAEOcrAdHH0ezCrsKZw4kbIkxP3T7ELask';
		// Define the URLs for the APIs
		const geocodeUrl =
			'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?inputtype=phonenumber';
		const detailsUrl =
			'https://maps.googleapis.com/maps/api/place/details/json';
		try {
			// Step 1: Get the Place ID using the Geocoding API
			const geocodeResponse = await axios.get(
				geocodeUrl + `&input=%2B${phone}`,
				{
					params: {
						// input: `%2B${phone}`,
						key: apiKey,
					},
				},
			);
			const geocodeData = geocodeResponse?.data;

			const placeId = geocodeData?.candidates[0]?.place_id;

			const detailsResponse = await axios.get(detailsUrl, {
				params: {
					placeid: placeId,
					key: apiKey,
				},
			});

			const detailsData = detailsResponse?.data;
			const rating = detailsData?.result?.rating;
			const user_ratings_total = detailsData?.result?.user_ratings_total;

			return { detailsData, rating, user_ratings_total };
		} catch (error) {
			console.error('error', error);
			// throw new Error(`Place Details API error`);
			return 'An error occurred while fetching the rating';
		}
	} else {
		return { detailsData: null, rating: null, user_ratings_total: null };
	}
}

async function reorderFunction(order, database) {
	const orderArr = order;
	const promises = orderArr.map((id, index) => {
		return db[database]
			.update(
				{ weight: index },
				{
					where: { id },
					returning: true,
					plain: true,
					raw: true,
				},
			)
			.then(async (data) => {
				return data[1];
			});
	});

	await Promise.all(promises);
}
function removeItemArray(arr, value) {
	const index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

async function updatePlaceFilters(
	filterIdsArr,
	filterIds,
	id,
	deletePlaceTofilter,
	createPlaceTofilter,
	transaction,
) {
	if (filterIdsArr.length === 0) {
		await deletePlaceTofilter(id);
	} else {
		for (const filter of filterIdsArr) {
			if (!filterIds.includes(filter)) {
				await createPlaceTofilter(filter, id, transaction);
			} else {
				const index = filterIds.indexOf(filter);
				if (index > -1) {
					filterIds.splice(index, 1);
				}
			}
		}
		if (filterIds.length > 0) {
			for (const filterToDelete of filterIds) {
				await deletePlaceTofilter(id, filterToDelete, transaction);
			}
		}
	}
}
async function updatePlaceCategories(
	filterIdsArr,
	filterIds,
	id,
	deletePlaceTofilter,
	createPlaceTofilter,
	updatePlaceToCategory,
	transaction,
) {
	if (filterIdsArr.length === 0) {
		await deletePlaceTofilter(id);
	} else {
		for (const filter of filterIdsArr) {
			if (!filterIds.includes(filter.value)) {
				await createPlaceTofilter(filter, id, transaction);
			} else {
				updatePlaceToCategory(filter, id, transaction);
				const index = filterIds.indexOf(filter.value);
				if (index > -1) {
					filterIds.splice(index, 1);
				}
			}
		}
		if (filterIds.length > 0) {
			for (const filterToDelete of filterIds) {
				await deletePlaceTofilter(id, filterToDelete, transaction);
			}
		}
	}
}
async function deleteItem(db, userId, id) {
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const deletedRecord = await db[db]
		.update(
			{ deleted_by: userId, deletedAt: Sequelize.DataTypes.NOW },
			{
				where: { id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return deletedRecord;
}

function padNumber(num) {
	return num.toString().padStart(3, '0');
}
function capitalizeString(word) {
	const arr = word?.split(' ').map((v) => v[0]?.toUpperCase() + v?.slice(1));
	return arr?.join(' ');
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

const getDisplayTime = async (place) => {
	place.timings = await db.timing.findAll({
		where: { place_id: place.id },
		attributes: ['id', 'day', 'opening', 'closing'],
		raw: true,
	});
	place.timings = place.timings?.reduce((acc, timing) => {
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
	const todayTime = place.timings?.filter(
		(v) => v.day === currentDay.toLowerCase() || 'daily',
	)[0];

	if (todayTime) {
		if (todayTime?.opening === '00:00' && todayTime?.closing === '23:59') {
			place.displayTime = 'Open 24 hours';
		} else {
			if (todayTime?.closing) {
				place.displayTime = `Open until ${todayTime?.closing}`;
			} else {
				place.displayTime = 'Open 24 hours';
			}
		}
	} else {
		place.displayTime = 'Closed';
	}
};

export {
	refactorCode,
	searchIds,
	searchManytoMany,
	findCommonElements,
	searchManytoManyTitle,
	searchManytoManyArray,
	nearByCondition,
	getTimingPool,
	searchManytoManyTiming,
	getDistance,
	padId,
	getGoogleRating,
	searchManytoManyDays,
	searchManytoManyDaysArrNew,
	convert24to12,
	searchManytoManyDaysFilters,
	reorderFunction,
	removeItemArray,
	updatePlaceFilters,
	updatePlaceCategories,
	deleteItem,

	checkDeletedCondition,
	softDelete,
	numberToWords,
	padNumber,
	capitalizeString,
	getAssociatePlaces,
	daysOfWeek,

	getDisplayTime,
};
