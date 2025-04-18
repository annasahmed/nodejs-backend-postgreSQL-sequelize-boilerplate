import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { roleService } from '../services/index.js';


const createRole = catchAsync(async (req, res) => {
	const role = await roleService.createRole(req);
	res.send({ role });
});

const getRoles = catchAsync(async (req, res) => {
	const roles = await roleService.getRoles(req);
	res.send({ roles });
});

const getRole = catchAsync(async (req, res) => {
	const role = await roleService.getRoleById(req.params.roleId);
	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}
	res.send({ role });
});

const deleteRole = catchAsync(async (req, res) => {
	await roleService.deleteRoleById(req.params.roleId);
	res.send({ success: true });
});

const updateRole = catchAsync(async (req, res) => {
	const role = await roleService.updateRole(req);
	res.send({ role });
});

export default {
	createRole,
	getRoles,
	getRole,
	updateRole,
	deleteRole,
};
