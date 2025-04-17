const httpStatus = require('http-status');
const { getOffset } = require('../utils/query');
const ApiError = require('../utils/ApiError');
const config = require('../config/config.js');
const db = require('../db/models').default;
const { updatePlaceCategories, updatePlaceFilters } = require('../utils/globals.js');

async function getRoleById(roleId) {
	const role = await db.role.findOne({
		where: { id: roleId },
	});

	return role;
}

async function getRoleByName(name) {
	const role = await db.role.findOne({
		where: { name },
	});

	return role;
}

async function getRoles(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const roles = await db.role.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		limit,
		offset,
		raw: true,
	});

	for (const role of roles.rows) {
		role.permissions = (
			await db.role_to_permission.findAll({
				where: { role_id: role.id },
				raw: true,
			})
		)?.map((v) => v.permissionId);
	}

	return roles;
}

async function createRole(req) {
	const { name, description = '', permissions } = req.body;
	const existedRole = await getRoleByName(name);

	if (existedRole) {
		throw new ApiError(httpStatus.CONFLICT, 'This role already exits');
	}
	const permissionsArr = JSON.parse(permissions);

	if (!permissionsArr.length) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'There should be at least 1 permission',
		);
	}

	const createdRole = await db.role
		.create({
			name,
			description,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));
	for (const permit of permissionsArr) {
		await createRoleToPermission(createdRole.id, permit);
	}

	return createdRole;
}
async function getPermissionbyRoleId(roleId) {
	const permissionIds = await db.role_to_permission.findAll({
		where: { role_id: roleId },
		raw: true,
	});
	return permissionIds?.map((v) => v.permissionId);
}
async function createRoleToPermission(permissionId, roleId) {
	await db.role_to_permission.create(
		{
			roleId,
			permissionId,
		},
		// { // transaction },
	);
}
async function deleteRoleToPermission(roleId, permissionId, transaction) {
	if (permissionId) {
		await db.role_to_permission.destroy({
			where: {
				role_id: roleId,
				permission_id: permissionId,
			},
			// // transaction,
		});
	} else {
		await db.role_to_permission.destroy({
			where: { role_id: roleId },
			// // transaction,
		});
	}
}

async function updateRole(req) {
	const { permissions } = req.body;
	const id = req.params.roleId;

	const permissionsArr = permissions && JSON.parse(permissions);

	const updatedRole = await db.role.update(
		{ ...req.body },
		{
			where: { id },
			returning: true,
			plain: true,
			raw: true,
		},
	);
	if (permissionsArr && permissionsArr?.length > 0) {
		const permissioncatIds = await getPermissionbyRoleId(id);
		await updatePlaceFilters(
			permissionsArr,
			permissioncatIds,
			id,
			deleteRoleToPermission,
			createRoleToPermission,
			// transaction,
		);
	}

	return updatedRole;
}
async function deleteRoleById(roleId) {
	const deletedRole = await db.role.destroy({
		where: { id: roleId },
	});

	if (!deletedRole) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}

	return deletedRole;
}
module.exports = {
	getRoleById,
	getRoles,
	createRole,
	updateRole,
	deleteRoleById,
};
