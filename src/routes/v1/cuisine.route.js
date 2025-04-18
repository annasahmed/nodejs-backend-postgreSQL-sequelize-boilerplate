const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { cuisineController } = require('../../controllers');

const router = express.Router();

router.route('/').get(cuisineController.getCuisines).post(
	// grantAccess('createAny', resources.ROLE),
	// validate(roleValidation.createRole),
	cuisineController.addCuisine,
);
router
	.route('/:cuisineId')
	.get(cuisineController.getCuisineById)
	.delete(cuisineController.deleteCuisine)
	.patch(cuisineController.updateCuisine);

export default router;
