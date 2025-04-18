import httpStatus from 'http-status'
const { getOffset } = require('../../../utils/query');
const ApiError = require('../../../utils/ApiError');
const { encryptData } = require('../../../utils/auth').default;
const config = require('../../../config/config.js');
const db = require('../../../db/models').default;
const userService = require('../../user.service');
const { refactorCode } = require('../../../utils/globals.js');
const { default: axios } = require('axios');
const API_KEY = 'fca_live_wnmEcQ6HkM9hPjDXAirWHaJKfn9ERZQq4tpl5VHB';
const API_URL = `https://open.er-api.com/v6/latest/AED`;

// async function getCurrencies(req, res) {
// 	const { currency, amount } = req.query;

// 	try {
// 		const response = await axios.get(API_URL);
// 		const rates = response.data.data;

// 		if (!rates[currency]) {
// 			return res.status(400).send('Invalid currency code');
// 		}

// 		const conversionRate = rates[currency];
// 		const amountInAED = parseFloat(amount); // Convert the passed amount to float
// 		const amountInTargetCurrency = (amountInAED * conversionRate).toFixed(
// 			2,
// 		);
// 		return {
// 			amountInAED,
// 			targetCurrency: currency,
// 			amountInTargetCurrency,
// 			rate: conversionRate,
// 		};
// 	} catch (error) {
// 		console.error('Error fetching data from the API', error);
// 		res.status(500).send('Error fetching data from the API');
// 	}
// }
async function getCurrencies(req, res) {
	const currency = await db.currency.findAll({
		order: [['country', 'ASC']],
		attributes: ['image', 'country', 'rate'],
	});
	return currency;
}

async function addCurrency(req, res) {
	const { currency, amount } = req.query;

	try {
		const response = await axios.get(API_URL);
		const rates = response.data.data;

		if (!rates[currency]) {
			return res.status(400).send('Invalid currency code');
		}

		const conversionRate = rates[currency];
		const amountInAED = parseFloat(amount); // Convert the passed amount to float
		const amountInTargetCurrency = (amountInAED * conversionRate).toFixed(
			2,
		);
		return {
			amountInAED,
			targetCurrency: currency,
			amountInTargetCurrency,
			rate: conversionRate,
		};
	} catch (error) {
		console.error('Error fetching data from the API', error);
		res.status(500).send('Error fetching data from the API');
	}
}
async function getCuisineById(id) {
	const cuisine = await db.cuisine.findOne({
		where: { id },
		include: [
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
	});
	refactorCode(cuisine, [
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);
	return cuisine;
}
async function getCurrencyByTitle(country) {
	const currency = await db.currency.findOne({
		where: { country },
		attributes: ['id'],
	});

	return currency;
}
async function createCurrency(req) {
	const { country, image } = req.body;

	const currency = await getCurrencyByTitle(country);

	if (currency) {
		throw new ApiError(httpStatus.CONFLICT, 'This currency already exits');
	}

	const response = await axios.get(API_URL);
	const rate = response?.data?.rates[`${country}`];
	if (!rate) {
		throw new ApiError(
			httpStatus.CONFLICT,
			'Exchange rate not found for this country',
		);
	}
	const createdCurrency = await db.currency
		.create({
			country,
			image,
			rate,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdCurrency;
}

async function getCuisines(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const cuisines = await db.cuisine.findAndCountAll({
		order: [
			['title', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		include: [
			// {
			// 	model: db.status,
			// 	require: true,
			// 	attributes: ['id', 'name'],
			// },
			{
				model: db.user,
				require: true,
				attributes: ['id', 'first_name', 'last_name'],
			},
		],
		attributes: [
			'id',
			'title',
			'status',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
		raw: true,
	});
	refactorCode(cuisines, [
		// {
		// 	title: 'status',
		// 	items: ['id', 'name'],
		// },
		{
			title: 'user',
			items: ['id', 'first_name', 'last_name'],
		},
	]);

	return cuisines;
}

async function deleteCuisineById(req) {
	const deletedCuisine = await db.cuisine.destroy({
		where: { id: req.params.cuisineId || req.body.id },
	});

	if (!deletedCuisine) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Cuisine not found');
	}

	return deletedCuisine;
}

async function updateCuisine(req) {
	const { title, statusId, userId } = req.body;
	if (title) {
		const cuisine = await getCuisineByTitle(title);

		if (cuisine) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This cuisine already exits',
			);
		}
	}
	if (userId) {
		const user = await userService.getUserById(userId);

		if (!user) {
			throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
		}
	}

	const updatedCuisine = await db.cuisine
		.update(
			{ ...req.body },
			{
				where: { id: req.params.cuisineId || req.body.id },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedCuisine;
}

export default {
	createCurrency,
	getCurrencies,
};
