const express = require('express');
const { notificationController } = require('../../controllers');
const {
	validateCreateNotification,
	validateUpdateNotification,
} = require('../../validations/Notification/Notification.validation');
const upload = require('../../middlewares/multerUpload');

const router = express.Router();

router
	.route('/')
	.get(notificationController.getNotifications)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		validateCreateNotification,
		notificationController.createNotification,
	);
router
	.route('/:id')
	.get(notificationController.getNotificationById)
	.delete(notificationController.deleteNotification)
	.post(
		upload.fields([{ name: 'image', maxCount: 1 }]),
		validateUpdateNotification,
		notificationController.updateNotification,
	);

router.post('/:id/send', notificationController.sendNotification);

router
	.route('/:id/:notificationId')
	.delete(notificationController.deleteAppNotification);

export default router;
