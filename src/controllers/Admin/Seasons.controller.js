const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { adminSeasonsService } = require('../../services');
const ApiError = require('../../utils/ApiError')

// Get season by ID
const getSeasonById = catchAsync(async (req, res) => {
	const { seasonId } = req.params;
	if (!seasonId){
		throw new ApiError(httpStatus.BAD_REQUEST, 'Season ID is required');
	}
	const season = await adminSeasonsService.getSeasonById(seasonId);
	res.send({ season });
});

// Get all seasons
const getSeasons = catchAsync(async (req, res) => {
	const seasons = await adminSeasonsService.getSeasons(req);
	res.send({ ...seasons });
});

// Get all seasons
const getAllSeasons = catchAsync(async (req, res) => {
	const seasons = await adminSeasonsService.getAllSeasons(req);
	res.send({ seasons });
});

// Add a new season
const addSeason = catchAsync(async (req, res) => {
	const season = await adminSeasonsService.createSeason(req);
	res.status(httpStatus.CREATED).send({ season });
});

// Delete a season by ID
const deleteSeason = catchAsync(async (req, res) => {
	await adminSeasonsService.deleteSeasonById(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'Deleted successfully' });
});

// Update a season by ID
const updateSeason = catchAsync(async (req, res) => {
	const season = await adminSeasonsService.updateSeason(req);
	res.status(httpStatus.ACCEPTED).send({ season });
});

module.exports = {
	getSeasons,
	getSeasonById,
	addSeason,
	deleteSeason,
	updateSeason,
	getAllSeasons
};
