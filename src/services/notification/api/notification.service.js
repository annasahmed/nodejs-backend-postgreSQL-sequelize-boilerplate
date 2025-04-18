import { NOT_FOUND } from 'http-status';
import db from '../../../db/models/index.js';
import ApiError from '../../../utils/ApiError.js';

const getNotificationsByUserId = async (req, res) => {
	const limit = req.query.limit ?? 10;
	const page = req.query.page ?? 1;
	const offset = (page - 1) * limit;

	const { rows, count } = await db.appUser_notification.findAndCountAll({
		limit,
		offset,
		attributes: [],
		order: [['id', 'DESC']],
		where: {
			app_user_id: req.params.id,
		},
		include: [
			{
				model: db.notifications,
				attributes: [
					'id',
					'title',
					'description',
					'image',
					'place_id',
					'sent_at',
				],
			},
		],
	});
	return {
		total: count,
		page: parseInt(page),
		data: rows?.map((v) => {
			return v.get({ plain: true }).notification;
		}),
		limit: limit,
	};
};
const deleteNotification = async (req, res) => {
	const deleted = await db.appUser_notification.destroy({
		where: {
			app_user_id: req.params.id,
			notification_id: req.params.notificationId,
		},
	});
	if (!deleted) {
		throw new ApiError(NOT_FOUND, 'Notification not found');
	}
	return deleted;
};
export default {
	getNotificationsByUserId,
	deleteNotification,
};
