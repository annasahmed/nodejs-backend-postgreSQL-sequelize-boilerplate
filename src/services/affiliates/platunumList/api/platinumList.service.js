const axios = require('axios');
const redisClient = require('../../../../config/redis');
const { checkDeletedCondition } = require('../../../../utils/globals');
const db = require('../../../../db/models').default;
const { getOffset } = require('../../../../utils/query');
const { Op } = require('sequelize');
const ApiError = require('../../../../utils/ApiError');
import httpStatus from 'http-status'
const API_KEY = 'ddc51f83-65eb-46df-8ac4-ee1b74e2af63';

const countryBounds = {
	UAE: {
		latMin: 22.6,
		latMax: 26.5,
		lngMin: 51.0,
		lngMax: 56.5,
		currency: 'AED',
	},
	Oman: {
		latMin: 16.5,
		latMax: 26.0,
		lngMin: 51.0,
		lngMax: 60.0,
		currency: 'OMR',
	},
	Qatar: {
		latMin: 24.5,
		latMax: 26.0,
		lngMin: 50.5,
		lngMax: 51.5,
		currency: 'QAR',
	},
	Bahrain: {
		latMin: 25.5,
		latMax: 26.3,
		lngMin: 50.3,
		lngMax: 50.8,
		currency: 'BHD',
	},
	SaudiArabia: {
		latMin: 16.0,
		latMax: 32.0,
		lngMin: 34.0,
		lngMax: 56.0,
		currency: 'SAR',
	},
	Turkey: {
		latMin: 36.0,
		latMax: 42.1,
		lngMin: 26.0,
		lngMax: 45.0,
		currency: 'TRY',
	},
};

const getCurrencyByLocation = (latitude, longitude) => {
	for (const country in countryBounds) {
		const bounds = countryBounds[country];
		if (
			latitude >= bounds.latMin &&
			latitude <= bounds.latMax &&
			longitude >= bounds.lngMin &&
			longitude <= bounds.lngMax
		) {
			return bounds.currency;
		}
	}

	return 'AED';
};

const refactorResponse = (apiResponse) => {
	if (!apiResponse) return;
	const data = apiResponse.data.data?.map((event) => {
		let price;
		console.log(
			event?.price?.data?.price,
			event?.price?.data?.price < 0,
			'chkk price',
		);

		if (!event?.price?.data?.price) {
			price = null;
		} else {
			if (event?.price?.data?.price === 0) {
				price = 'Free pass';
			} else {
				if (event?.price?.data?.price < 0) {
					if (event.has_sales_started) {
						price = 'Tickets Selling Closed';
					} else {
						price = 'Coming Soon';
					}
				} else {
					price =
						event?.price?.data?.price +
						' ' +
						event?.price?.data?.currency;
				}
			}
		}
		return {
			...event,
			url: `${event.url}?ref=nznkywf`,
			price,
		};
	});
	return data;
};

async function getEventsByEventType(req) {
	const { eventType, limit = 10, page = 1, search, cityId, all } = req.query; // Use query params to extract limit, page, eventType
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);

	let apiUrl = `https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&has_tickets&status=on sale&per_page=${limit}&page=${page}&include=price`;

	if (cityId) {
		apiUrl += `&city.id=${cityId}`;
	}
	const currency =
		latitude && longitude
			? getCurrencyByLocation(latitude, longitude)
			: 'AED';
	if (!eventType || JSON.parse(eventType).length === 0) {
		const cacheKey = `events:all:city:${cityId || 'all'}:currency:${currency}:${limit}:${page}:all:${all || false}`;

		const cachedData = await redisClient.get(cacheKey);

		if (cachedData) {
			// console.log('Returning cached data');
			const data = [{}];
			data[0] = JSON.parse(cachedData); // Parse and return cached data
			return data;
		} else {
			const options = {
				url: apiUrl,
				method: 'GET',
				headers: {
					'Api-Key': API_KEY,
					'Api-Currency': currency,
				},
			};
			const apiResponse = await axios(options);
			const data = [{}];
			data[0].events = refactorResponse(apiResponse);
			data[0].total = apiResponse.data.meta.pagination.total;
			data[0].limit = apiResponse.data.meta.pagination.per_page;
			data[0].page = apiResponse.data.meta.pagination.current_page;
			await redisClient.setEx(
				cacheKey,
				3600,
				JSON.stringify({
					events: data[0].events,
					total: data[0].total,
					limit: data[0].limit,
					page: data[0].page,
				}),
			);
			return data;
		}
	}

	if (all) {
		const data = [{}];
		const mainCategory = await db.affiliate.findOne({
			where: {
				id: JSON.parse(eventType)[0],
			},
			attributes: ['reference_id', 'title'],
			raw: true,
		});
		if (mainCategory) {
			const event = [0, ...mainCategory.reference_id];
			const cacheKey = `events:${event || 'all'}:city:${cityId || 'all'}:currency:${currency}:${limit}:${page}:all:${all || false}`;

			const cachedData = await redisClient.get(cacheKey);

			if (cachedData) {
				// console.log('Returning cached data');
				const tempData = JSON.parse(cachedData); // Parse and return cached data
				data[0] = tempData;
			} else {
				const options = {
					url: apiUrl + `&event_type.id=[${event}]`,
					method: 'GET',
					headers: {
						'Api-Key': API_KEY,
						'Api-Currency': currency,
					},
				};
				console.log(options.url, 'chkk url');

				const apiResponse = await axios(options);
				data[0].events = refactorResponse(apiResponse);
				data[0].total = apiResponse.data.meta.pagination.total;
				data[0].limit = apiResponse.data.meta.pagination.per_page;
				data[0].page = apiResponse.data.meta.pagination.current_page;
				await redisClient.setEx(
					cacheKey,
					3600,
					JSON.stringify({
						events: data[0].events,
						total: data[0].total,
						limit: data[0].limit,
						page: data[0].page,
					}),
				);
			}
			return data;
		} else {
			throw new Error('Invalid event id');
		}
	}

	const data = [];

	for (const event of JSON.parse(eventType)) {
		const cacheKey = `events:${event || 'all'}:city:${cityId || 'all'}:currency:${currency}:${limit}:${page}:all:${all || false}`;

		const category = await db.affiliate.findOne({
			where: {
				reference_id: { [Op.eq]: [event] },
			},
			attributes: ['reference_id', 'title'],
			raw: true,
		});

		if (category) {
			const cachedData = await redisClient.get(cacheKey);

			if (false && cachedData) {
				// console.log('Returning cached data');
				const tempData = JSON.parse(cachedData); // Parse and return cached data
				data.push(tempData);
			} else {
				const options = {
					url: apiUrl + `&event_type.id=${event}`,
					method: 'GET',
					headers: {
						'Api-Key': API_KEY,
						'Api-Currency': currency,
					},
				};
				const apiResponse = await axios(options);
				category.events = refactorResponse(apiResponse);
				category.total = apiResponse.data.meta.pagination.total;
				category.limit = apiResponse.data.meta.pagination.per_page;
				category.page = apiResponse.data.meta.pagination.current_page;
				await redisClient.setEx(
					cacheKey,
					3600,
					JSON.stringify({
						reference_id: category.reference_id,
						title: category.title,
						events: category.events,
						total: category.total,
						limit: category.limit,
						page: category.page,
					}),
				);
			}

			if (category.events && category.events.length > 0) {
				data.push(category);
			}
		}
	}

	return data;
}

async function getEvents(req) {
	const { eventType, limit = 10, page = 1, search, cityId } = req.query; // Use query params to extract limit, page, eventType
	const latitude = parseFloat(req.headers['latitude']);
	const longitude = parseFloat(req.headers['longitude']);

	let apiUrl = `https://api.platinumlist.net/v/7/events?scope=affiliate.show.events&has_tickets&status=on sale&per_page=${limit}&page=${page}&include=price`;
	const currency =
		latitude && longitude
			? getCurrencyByLocation(latitude, longitude)
			: 'AED';
	if (eventType) {
		const eventId = [0, ...JSON.parse(eventType)]?.join(',');
		apiUrl += `&event_type.id=${eventId}`;
		// &city.id=2
	}
	if (cityId) {
		apiUrl += `&city.id=${cityId}`;
	}
	// if (search) {
	// 	apiUrl += `&search=${search}`;
	// }

	// Create a unique cache key based on the eventType, limit, and page
	const cacheKey = `events:${eventType || 'all'}:city:${cityId || 'all'}:currency:${currency}:${limit}:${page}`;

	try {
		// Step 1: Check if data exists in Redis cache
		const cachedData = await redisClient.get(cacheKey);

		if (cachedData) {
			// console.log('Returning cached data');
			return JSON.parse(cachedData); // Parse and return cached data
		}

		// Step 2: If not cached, fetch data from the external API
		const options = {
			url: apiUrl,
			method: 'GET',
			headers: {
				'Api-Key': API_KEY,
				'Api-Currency': currency,
			},
		};

		const apiResponse = await axios(options);
		// const data = apiResponse.data;

		const data = apiResponse.data.data?.map((event) => {
			let price;
			if (!event?.price?.data?.price) {
				price = null;
			} else {
				if (event?.price?.data?.price === 0) {
					price = 'Free pass';
				} else {
					if (event?.price?.data?.price > 0) {
						price = 'Closed';
					}
					price =
						event?.price?.data?.price +
						' ' +
						event?.price?.data?.currency;
				}
			}
			return {
				...event,
				url: `${event.url}?ref=nznkywf`,
				price,
			};
		});

		// Step 3: Cache the API response for 1 hour (3600 seconds)
		await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

		// console.log('Data fetched from API and cached');
		return { data, apiUrl };
	} catch (error) {
		console.error('Error fetching data from API:', error);
		throw new Error('Error fetching events');
	}
}
// 111
const provider = 'platinumlist';

async function getAffiliateCategories(req) {
	const affiliateCategories = await db.affiliate.findAndCountAll({
		order: [
			['weight', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		where: {
			provider,
			status: true,
			...checkDeletedCondition,
		},
		raw: true,
		attributes: ['id', 'title', 'image', 'reference_id', 'color'],
	});

	return affiliateCategories;
}

async function getAffiliateAreas(req) {
	const { limit = 10, page = 1, search } = req.query;
	// const latitude = parseFloat(req.headers['latitude']);
	// const longitude = parseFloat(req.headers['longitude']);
	const offset = getOffset(page, limit);
	const searchCondition = search
		? 'AND (country ILIKE :search OR name ILIKE :search)'
		: '';
	const affiliateAreas = await db.sequelize.query(
		`
			  WITH paginated_cities AS (
				SELECT id, name, country, reference_id
				FROM affiliate_area
				WHERE provider = :provider
				${searchCondition}  -- Apply search condition if searchKeyword is present
				ORDER BY country, name  -- You can adjust the order if needed
				LIMIT :limit OFFSET :offset
			  ),
			  grouped_countries AS (
				SELECT country, 
					   json_agg(json_build_object('id', id, 'name', name, 'reference_id', reference_id)) AS cities
				FROM paginated_cities
				GROUP BY country
			  )
			  SELECT * FROM grouped_countries;
			`,
		{
			replacements: {
				provider,
				limit,
				offset,
				search: search ? `${search}%` : undefined, // Only pass `search` if `searchKeyword` is defined
			},
			type: db.Sequelize.QueryTypes.SELECT,
		},
	);

	return affiliateAreas;
}

export default {
	getEvents,
	getAffiliateCategories,
	getAffiliateAreas,
	getEventsByEventType,
};
