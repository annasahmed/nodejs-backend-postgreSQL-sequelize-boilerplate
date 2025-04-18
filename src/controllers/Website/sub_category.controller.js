const { webisteSubCategoryservice } = require('../../services/Website');
import catchAsync from '../../utils/catchAsync'

const getCategories = catchAsync(async (req, res) => {
	const categories = await webisteSubCategoryservice.getCategories(req);
	res.send({ categories });
});

export default {
	getCategories,
};
