import express from 'express';
import authRoute from './auth.route.js';
import infoRoute from './info.route.js';
import logRoute from './log.route.js';
import metadataRoute from './metadata.route.js';
import notificationRoute from './notification.route.js';
import pageRoute from './page.route.js';
import roleRoute from './role.route.js';
import userRoute from './user.route.js';

// affiliates

// website

const router = express.Router();

// auth
router.use('/auth', authRoute);
router.use('/imageUpload', authRoute);

router.use('/metadata', metadataRoute);

router.use('/role', roleRoute);
router.use('/log', logRoute);
// users
router.use('/users', userRoute);

router.use('/notifications', notificationRoute);

router.use('/page', pageRoute);

// setting
router.use('/info', infoRoute);

export default router;
