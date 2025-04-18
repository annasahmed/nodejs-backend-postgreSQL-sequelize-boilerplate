const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const categoryController = require('../../controllers/sub_category.controller');
const cuisineController = require('../../controllers/cuisine.controller');
const uspController = require('../../controllers/usp.controller');

const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');
const { metadataController } = require('../../controllers');

const router = express.Router();

router.route('/').get(metadataController.getMetadata);

router.route('/cms').get(metadataController.getMetadataCms);
router.route('/dashboard').get(metadataController.getMetadataDashboard);
router
	.route('/invoices-reports')
	.get(metadataController.getInvoicesReportDashboard);
export default router;
