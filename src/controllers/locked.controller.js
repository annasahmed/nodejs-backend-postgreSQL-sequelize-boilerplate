import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
const { adminLockedService } from '../services'

const getLocked = catchAsync(async (req, res) => {
	const locked = await adminLockedService.getLockedByCondition(req);
	res.send({ locked });
});

const addLocked = catchAsync(async (req, res) => {
	const locked = await adminLockedService.createLocked(req);
	res.status(httpStatus.CREATED).send({ locked });
});

const deleteLockedByUserId = catchAsync(async (req, res) => {
	await adminLockedService.deleteLockedByUserId(req);
	res.status(httpStatus.ACCEPTED).send({ message: 'deleted successfully' });
});
const getLockedByUserId = catchAsync(async (req, res) => {
	const locked = await adminLockedService.getLockedByUserId(req);
	res.send({ locked });
});

export default {
	getLocked,
	addLocked,
	deleteLockedByUserId,
	getLockedByUserId,
};
