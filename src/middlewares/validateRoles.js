import db from '../db/models/index.js';
import { getUserById } from '../services/user.service.js';
import { verifyToken } from '../utils/auth.js';

const getMethod = (method) => {
	switch (method) {
		case 'create':
			return 'POST';
		case 'read':
			return 'GET';
		case 'update':
			return 'PATCH';
		case 'delete':
			return 'DELETE';
	}
};
const restrictedRoutes = ['/place', '/user'];
// const restrictedRoutes = [
// 	'/users',
// 	'/places',
// 	'/appuser',
// 	'/role',
// 	'/page',
// 	'/notifications',
// 	'/home',
// 	'/filters',
// 	'/subCategory',
// 	'/cuisine',
// 	'/usp',
// 	'/emirate',
// 	'/area',
// 	'/neighbourhood',
// 	'/settings',
// ];
const validateRoles = async (req, res, next) => {
	if (req.headers.authorization && req.headers.clientid === 'cms') {
		const restrictedRoutes = (
			await db.permission.findAll({
				attributes: ['parent'], // Select the parent column
				group: ['parent'], // Group by the parent column
				raw: true,
			})
		)?.map((v) => `/${v.parent}`);

		if (restrictedRoutes.includes('filter')) {
			restrictedRoutes.push(
				'subCategory',
				'cuisine',
				'usp',
				'emirate',
				'area',
				'neighbourhood',
			);
		}
		if (
			restrictedRoutes.filter(
				(v) =>
					req.originalUrl.includes(v) &&
					!req.originalUrl.includes('/locked') &&
					!req.originalUrl.includes('/search'),
			).length
		) {
			const { userId } = await verifyToken(req.headers.authorization);

			const roleId = (await getUserById(userId))?.role_id;

			const permissions = (
				await db.role_to_permission.findAll({
					where: { roleId },
					raw: true,
				})
			)?.map((v) => v.permissionId);

			const permittedRoutes = (
				await db.permission.findAll({
					where: { id: permissions },
					raw: true,
				})
			)?.map((v) => {
				return getMethod(v.name) + '/v1/' + v.parent;
			});

			const url = req.originalUrl
				.split('/')
				.slice(0, 3)
				.join('/')
				.split('?')[0]
				.toLowerCase();

			const condition = permittedRoutes.includes(
				// url.endsWith('s') ? req.method + url : req.method + url + 's',
				req.method + url,
			);

			if (!condition) {
				return res.status(403).json({ message: 'Forbidden' });
			}
		}
	}
	next();
};

export default {
	validateRoles,
};
