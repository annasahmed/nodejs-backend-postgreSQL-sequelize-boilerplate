const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { areaController } = require('../../controllers');

const router = express.Router();

router.route('/').get(areaController.getAreas).post(areaController.addArea);
router
	.route('/:areaId')
	.delete(areaController.deleteArea)
	.patch(areaController.updateArea);

module.exports = router;
