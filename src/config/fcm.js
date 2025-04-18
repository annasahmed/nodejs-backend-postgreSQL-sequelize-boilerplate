import admin from 'firebase-admin';
const serviceAccount = require(process.env.FCM_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export default {
	FcmNotificationService: admin,
};
