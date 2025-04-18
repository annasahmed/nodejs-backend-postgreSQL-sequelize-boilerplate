const { webistePlaceservice } = require('../../services/Website');
import catchAsync from '../../utils/catchAsync'

const getPlaces = catchAsync(async (req, res) => {
	const places = await webistePlaceservice.getPlaces(req);
	res.send({ places });
});

const getPlacesByCategory = catchAsync(async (req, res) => {
	const places = await webistePlaceservice.getPlacesByCategory(req);
	res.send({ places });
});

const getPlacesBanner = catchAsync(async (req, res) => {
	const banner = await webistePlaceservice.getPlacesBanner(req);
	res.send({ banner });
});

export default {
	getPlacesBanner,
	getPlaces,
	getPlacesByCategory,
};
