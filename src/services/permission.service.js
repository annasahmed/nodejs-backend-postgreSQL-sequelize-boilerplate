import httpStatus from 'http-status'
const { getOffset } = require('../utils/query');
import ApiError from '../utils/ApiError';
const config = require('../config/config.js');
import db from '../db/models'

async function getRoleById(roleId) {
	const permission = await db.permission.findOne({
		where: { id: roleId },
	});

	return permission;
}

async function getPermissionByParent(parent) {
	const permission = await db.permission.findOne({
		where: { parent },
	});

	return permission;
}
async function deletePermissionByParent(parent) {
	const permission = await db.permission.destroy({
		where: { parent },
	});

	return permission;
}
async function updatePermissionById(req) {
	const permission = await db.permission.update(
		{ ...req.body },
		{
			where: { parent: req.params.parent },
			returning: true,
			plain: true,
			raw: true,
		},
	);

	return permission;
}
async function getPermissionGroupByParent() {
	const permission = await db.permission.findAll({
		// order: [['parent', 'DESC']],
	});
	const formatted = [];
	let i = 0;
	let prevParent = permission[0] && permission[0].parent;
	for (const permit of permission) {
		if (prevParent !== permit.parent) {
			prevParent = permit.parent;
			i++;
		}
		if (formatted[i] && formatted[i].parent === prevParent) {
			formatted[i].roles.push({ id: permit.id, name: permit.name });
		} else {
			formatted[i] = { parent: prevParent, roles: [] };
			formatted[i].roles.push({ id: permit.id, name: permit.name });
		}
	}

	return formatted;
}

async function getRoles(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit } = req.query;

	const offset = getOffset(page, limit);

	const roles = await db.permission.findAndCountAll({
		order: [
			['name', 'ASC'],
			['created_date_time', 'DESC'],
			['modified_date_time', 'DESC'],
		],
		limit,
		offset,
		raw: true,
	});

	return roles;
}

async function createPermission(req, skipOnExist = false) {
	const { parent } = req.body;
	const existedPermission = await getPermissionByParent(parent);

	if (existedPermission) {
		if (skipOnExist) {
			return;
		}
		throw new ApiError(
			httpStatus.CONFLICT,
			'This permission already exits',
		);
	}

	const permissions = ['create', 'read', 'update', 'delete'].map((v) => {
		return { name: v, parent };
	});
	const createdRole = await db.permission.bulkCreate(permissions);

	return createdRole;
}

async function updateRole(req) {
	const updatedRole = await db.permission
		.update(
			{ ...req.body },
			{
				where: { id: req.params.roleId },
				returning: true,
				plain: true,
				raw: true,
			},
		)
		.then((data) => data[1]);

	return updatedRole;
}
async function deleteRoleById(roleId) {
	const deletedRole = await db.permission.destroy({
		where: { id: roleId },
	});

	if (!deletedRole) {
		throw new ApiError(httpStatus.NOT_FOUND, 'permission not found');
	}

	return deletedRole;
}

async function getPermissionByRoleId(roleId) {
	const allowedRoutes = [];
	const permission = (
		await db.role.findAll({
			where: { id: roleId },
			include: [
				{
					model: db.permission, // Include the Permission model
					through: {
						attributes: [], // Exclude the attributes of the join table (optional)
					},
					attributes: ['parent'], // Specify the attributes you want from the Permission model
				},
			],
			attributes: ['id'],
			raw: true,
		})
	)?.map((v) => v['permissions.parent']);

	for (const permit of permission) {
		if (!allowedRoutes.includes(permit)) {
			allowedRoutes.push(permit);
		}
	}

	return allowedRoutes;
}
export default {
	createPermission,
	getPermissionGroupByParent,
	getPermissionByRoleId,
	deletePermissionByParent,
	updatePermissionById,
};
