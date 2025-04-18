const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const { uspController } = require('../../controllers');
const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');

const router = express.Router();

router.route('/').get(uspController.getUsps).post(
	// grantAccess('createAny', resources.ROLE),
	// validate(roleValidation.createRole),
	uspController.addUsp,
);
router
	.route('/:uspId')
	.delete(uspController.deleteUsp)
	.patch(uspController.updateUsp);

export default router;
