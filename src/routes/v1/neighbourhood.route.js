const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { neighbourhoodController } = require('../../controllers');

const router = express.Router();

router
	.route('/')
	.get(neighbourhoodController.getNeighbourhoods)
	.post(neighbourhoodController.addNeighbourhood);
router
	.route('/:neighbourhoodId')
	.delete(neighbourhoodController.deleteNeighbourhood)
	.patch(neighbourhoodController.updateNeighbourhood);

export default router;
