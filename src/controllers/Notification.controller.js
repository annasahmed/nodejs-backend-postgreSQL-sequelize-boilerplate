import httpStatus from 'http-status';
import {
	adminNotificationService,
	apiNotificationService,
} from '../services/index.js';
import catchAsync from '../utils/catchAsync.js';

const createNotification = catchAsync(async (req, res) => {
	const notification = await adminNotificationService.createNotification(req);
	res.status(httpStatus.CREATED).send({ notification });
});

const getNotifications = catchAsync(async (req, res) => {
	const notifications = await adminNotificationService.getNotifications(req);
	res.status(httpStatus.OK).send(notifications);
});

const getNotificationById = catchAsync(async (req, res) => {
	const clientIdCms = req.headers['clientid'] === 'cms';
	const notification = clientIdCms
		? await adminNotificationService.getNotificationById(req)
		: await apiNotificationService.getNotificationsByUserId(req);
	res.status(httpStatus.OK).send({ notification });
});

const updateNotification = catchAsync(async (req, res) => {
	const notification = await adminNotificationService.updateNotification(req);
	res.status(httpStatus.OK).send({ notification });
});

const deleteNotification = catchAsync(async (req, res) => {
	await adminNotificationService.deleteNotification(req);
	res.status(httpStatus.NO_CONTENT).send();
});
const deleteAppNotification = catchAsync(async (req, res) => {
	await apiNotificationService.deleteNotification(req);
	res.status(httpStatus.NO_CONTENT).send();
});

const sendNotification = catchAsync(async (req, res) => {
	const response = await adminNotificationService.sendNotification(req);
	res.status(httpStatus.OK).send({ response });
});

export default {
	createNotification,
	getNotifications,
	deleteAppNotification,
	getNotificationById,
	updateNotification,
	deleteNotification,
	sendNotification,
};
