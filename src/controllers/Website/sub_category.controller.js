const { webisteSubCategoryservice } = require('../../services/Website');
const catchAsync = require('../../utils/catchAsync');

const getCategories = catchAsync(async (req, res) => {
	const categories = await webisteSubCategoryservice.getCategories(req);
	res.send({ categories });
});

module.exports = {
	getCategories,
};
