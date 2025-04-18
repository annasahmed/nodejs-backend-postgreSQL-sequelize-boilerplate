import express from 'express';
import { metadataController } from '../../controllers/index.js';

const router = express.Router();

router.route('/').get(metadataController.getMetadata);

router.route('/cms').get(metadataController.getMetadataCms);
router.route('/dashboard').get(metadataController.getMetadataDashboard);
router
	.route('/invoices-reports')
	.get(metadataController.getInvoicesReportDashboard);
export default router;
