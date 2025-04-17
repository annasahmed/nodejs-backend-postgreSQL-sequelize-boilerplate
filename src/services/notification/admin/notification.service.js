const db = require('../../../db/models').default;
const ApiError = require('../../../utils/ApiError');
const { NOT_FOUND } = require('http-status');
const { FcmNotificationService } = require('../../../config/fcm');
const { imageService } = require('../../index');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { addJobToQueue } = require('../../../queue/queue.service');
const { uploadToS3 } = require('../../image.service');

const createNotification = async (req, res) => {
	let path = null;
	if (req.files?.image?.[0]) {
		const date = dayjs();
		const file = req.files?.image[0];
		// get extension of image
		const extension = file.originalname.split('.').pop().toLowerCase();
		path = `notification/${date.year()}/${date.month()}/${date.date()}/${date.unix()}.${extension}`;
		path = await uploadToS3(file.buffer, path);
	}
	const userId = req.auth.userId;
	return await db.notifications.create({
		title: req.body.title,
		description: req.body.description,
		image: path,
		place_id: req.body.place_id == 'null' ? null : req.body.place_id,
		is_scheduled: req.body.is_scheduled,
		scheduled_at: req.body.is_scheduled ? req.body.scheduled_at : null,
		created_by: userId,
		created_date_time: new Date(),
		modified_date_time: new Date(),
	});
};

const getNotifications = async (req, res) => {
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;
	const search = req.query.search || '';
	//console.log('search', search);
	const { count, rows } = await db.notifications.findAndCountAll({
		limit,
		offset,
		order: [['id', 'DESC']],
		where: {
			title: {
				[Op.iLike]: `%${search}%`,
			},
		},
	});
	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
};

const getNotificationById = async (req, res) => {
	const notification = await db.notifications.findByPk(req.params.id, {
		include: [
			{
				model: db.place,
				as: 'place',
				attributes: ['id', 'title'],
			},
		],
	});
	if (!notification) {
		throw new ApiError(NOT_FOUND, 'Notification not found');
	}
	return notification;
};

const updateNotification = async (req, res) => {
	let path = null;
	if (req.files?.image?.[0]) {
		const date = dayjs();
		const file = req.files?.image[0];
		const extension = file.originalname.split('.').pop().toLowerCase();
		path = `notification/${date.year()}/${date.month()}/${date.date()}/${date.unix()}.${extension}`;
		path = await uploadToS3(file.buffer, path);
	} else {
		path = req.body.image;
	}
	const [updated] = await db.notifications.update(
		{
			title: req.body.title,
			description: req.body.description,
			image: path,
			place_id: req.body.place_id,
			is_scheduled: req.body.is_scheduled,
			scheduled_at: req.body.is_scheduled ? req.body.scheduled_at : null,
			modified_date_time: new Date(),
		},
		{
			where: { id: req.params.id },
		},
	);

	if (!updated) {
		throw new ApiError(NOT_FOUND, 'Notification not found');
	}
	return await db.notifications.findByPk(req.params.id);
};

const deleteNotification = async (req, res) => {
	const deleted = await db.notifications.destroy({
		where: { id: req.params.id },
	});
	if (!deleted) {
		throw new ApiError(NOT_FOUND, 'Notification not found');
	}
	return deleted;
};

const sendNotification = async (req, res) => {
	const { id } = req.params;
	const notification = await db.notifications.findByPk(id);
	if (!notification) {
		throw new ApiError(NOT_FOUND, 'Notification not found');
	}
	if (notification.is_sent) {
		throw new ApiError(400, 'Notification already sent');
	}

	const message = {
		notification: {
			title: notification.title,
			body: notification.description,
		},
		data: {},
		topic: process.env.NOTIFICATION_TOPIC || 'app-user',
	};
	if (notification.image) {
		message.notification.image = notification.image;
	}
	if (notification.place_id) {
		message.data.place_id = notification.place_id.toString();
	}
	//console.log('message', message);
	const response = await FcmNotificationService.messaging().send(message);
	if (!response) {
		throw new ApiError(500, 'Failed to send notification');
	}
	await db.notifications.update(
		{
			is_sent: true,
			sent_at: new Date(),
		},
		{
			where: { id: id },
		},
	);
	await addJobToQueue({
		type: 'register_user_notification',
		payload: {
			notification_id: id,
		},
	});
	return { message: 'Notification sent successfully', status: true };
};

const createUserNotification = async (notificationId) => {
	const users = await db.appUser.findAll();
	const userNotifications = users.map((user) => {
		return {
			notification_id: notificationId,
			app_user_id: user.id,
		};
	});
	await db.appUser_notification.bulkCreate(userNotifications);
	return true;
};

module.exports = {
	createNotification,
	getNotifications,
	getNotificationById,
	updateNotification,
	deleteNotification,
	sendNotification,
	createUserNotification,
};
