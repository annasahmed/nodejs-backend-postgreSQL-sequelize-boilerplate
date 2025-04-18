import admin from 'firebase-admin';
import serviceAccount from process.env.FCM_SERVICE_ACCOUNT_PATH;

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export default {
	FcmNotificationService: admin,
};
