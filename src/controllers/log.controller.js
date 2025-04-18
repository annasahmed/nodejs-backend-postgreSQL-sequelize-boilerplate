const { logService } from '../services'
import catchAsync from '../utils/catchAsync';

const getLogs = catchAsync(async (req, res) => {
	const logs = await logService.getLogs(req);
	res.send({ logs });
});
export default {
	getLogs,
};
