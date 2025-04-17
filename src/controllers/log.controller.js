const { logService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getLogs = catchAsync(async (req, res) => {
	const logs = await logService.getLogs(req);
	res.send({ logs });
});
module.exports = {
	getLogs,
};
