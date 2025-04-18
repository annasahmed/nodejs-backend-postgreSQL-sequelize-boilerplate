const express = require('express');
const validate = require('../../middlewares/validate');
const { permissionController } = require('../../controllers');

const { grantAccess } = require('../../middlewares/validateAccessControl');
const { resources } = require('../../config/roles');

const router = express.Router();

router
	.route('/')
	.get(permissionController.getPermissions)
	.post(permissionController.createPermission);

router
	.route('/:parent')
	.delete(permissionController.deletePermissions)
	.patch(permissionController.updatePermissionById);

export default router;
