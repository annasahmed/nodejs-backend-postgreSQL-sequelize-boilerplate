const db = require('../../db/models').default;

const getPlaceById = async (req, attributes = []) => {
	const { placeId } = req.params;
	return await db.place.findByPk(placeId, {
		attributes: attributes.length > 0 ? attributes : undefined
	});
};

export default {
	getPlaceById
};
