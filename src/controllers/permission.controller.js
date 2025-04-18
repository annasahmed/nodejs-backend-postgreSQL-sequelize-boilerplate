import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { permissionService } from '../services/index.js';

const createPermission = catchAsync(async (req, res) => {
	const permission = await permissionService.createPermission(req);
	res.send({ permission });
});
const getPermissions = catchAsync(async (req, res) => {
	const permission = await permissionService.getPermissionGroupByParent(req);
	res.send({ permission });
});
const deletePermissions = catchAsync(async (req, res) => {
	const permission = await permissionService.deletePermissionByParent(
		req.params.parent,
	);
	res.send({ permission });
});
const updatePermissionById = catchAsync(async (req, res) => {
	const permission = await permissionService.updatePermissionById(req);
	res.send({ permission });
});

const getRoles = catchAsync(async (req, res) => {
	const roles = await permissionService.getRoles(req);
	res.send({ roles });
});

const getRole = catchAsync(async (req, res) => {
	const role = await permissionService.getRoleById(req.params.roleId);
	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}
	res.send({ role });
});

const deleteRole = catchAsync(async (req, res) => {
	await permissionService.deleteRoleById(req.params.roleId);
	res.send({ success: true });
});

const updateRole = catchAsync(async (req, res) => {
	const role = await permissionService.updateRole(req);
	res.send({ role });
});

export default {
	createPermission,
	getPermissions,
	deletePermissions,
	updatePermissionById,
};
