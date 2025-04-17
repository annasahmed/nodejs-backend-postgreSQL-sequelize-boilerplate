const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { adminCurrencyService, imageService } = require('../services');
// https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_wnmEcQ6HkM9hPjDXAirWHaJKfn9ERZQq4tpl5VHB&currencies=EUR%2CUSD%2CCAD
const getCurrencyById = catchAsync(async (req, res) => {
	const Currency = await adminCurrencyService.getCurrencyById(
		req.params.CurrencyId,
	);
	res.send({ Currency });
});
const getCurrencies = catchAsync(async (req, res) => {
	const currencies = await adminCurrencyService.getCurrencies(req, res);

	res.send({ currencies });
});

const addCurrency = catchAsync(async (req, res) => {
	const image =
		req?.files?.image &&
		(await imageService.uploadImageToS3(req?.files?.image[0], 'currency'));
	req.body.image = image || null;
	const currency = await adminCurrencyService.createCurrency(req);
	res.status(httpStatus.CREATED).send({ currency });
});
const updateCurrency = catchAsync(async (req, res) => {
	const image =
		req?.files?.image &&
		(await imageService.uploadImageToS3(req?.files?.image[0], 'currency'));
	req.body.image = image || null;
	const currency = await adminCurrencyService.updateCurrency(req);
	res.status(httpStatus.ACCEPTED).send({ currency });
});

const deleteCurrency = catchAsync(async (req, res) => {
	await adminCurrencyService.deleteCurrencyById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const updateCurrenctRates = catchAsync(async (req, res) => {
	await adminCurrencyService.updateCurrenctRates(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'updated successfully' });
});

module.exports = {
	getCurrencies,
	addCurrency,
	deleteCurrency,
	updateCurrency,
	updateCurrenctRates,
};
