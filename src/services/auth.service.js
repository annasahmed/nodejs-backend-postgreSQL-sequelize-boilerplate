import httpStatus from 'http-status';
import db from '../db/models/index.js';
import { UserSavingsTransformer } from '../transformers.js';
import ApiError from '../utils/ApiError.js';
import { decryptData } from '../utils/auth.js';
import { getUserSaving } from './Api/UserSaving.service.js';
import { getPermissionByRoleId } from './permission.service.js';
import userService from './user.service.js';

async function loginUserWithEmailAndPassword(req, isUser = true) {
	const { email, password } = req.body;
	//console.log(email, password, 'testing');
	let user = '';
	if (isUser) {
		user = await userService.getUserByEmail(email);
	} else {
		user = await userService.getAppUserByEmail(email);
	}

	if (!user) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email');
	}
	const isPasswordMatch = await decryptData(password, user.password);

	if (!isPasswordMatch) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid email or password',
		);
	}
	if (user.isLogged === false) {
		if (isUser) {
			await db.user.update(
				{ isLogged: true },
				{
					where: { id: user.id },
					returning: true,
					plain: true,
					raw: true,
				},
			);
		} else {
			await db.appUser.update(
				{ isLogged: true },
				{
					where: { id: user.id },
					returning: true,
					plain: true,
					raw: true,
				},
			);
		}
	}
	delete user.password;

	if (isUser) {
		const allowedRoutes = await getPermissionByRoleId(user.role_id);
		user.allowedRoutes = allowedRoutes;
	} else {
		const places = await db.appUser_favourite_place.findAll({
			where: { app_user_id: user.id },
			attributes: ['place_id'],
			raw: true,
		});
		user.favorites = places?.map((v) => v.place_id);

		const userSavings = await getUserSaving({
			auth: {
				userId: user.id,
			},
		});
		user.savings = UserSavingsTransformer.transform(userSavings);
	}
	return user;
}
async function loginAppUserWithEmailAndPassword(req, isUser = true) {
	const { email, password } = req.body;
	let user = '';
	if (isUser) {
		user = await userService.getUserByEmail(email);
	} else {
		user = await userService.getAppUserByEmail(email);
	}

	if (!user) {
		throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email');
	}
	const isPasswordMatch = await decryptData(password, user.password);
	//console.log(isPasswordMatch);
	if (!isPasswordMatch) {
		throw new ApiError(
			httpStatus.UNAUTHORIZED,
			'Invalid email or password',
		);
	}
	if (user.isLogged === false) {
		await db.user.update(
			{ isLogged: true },
			{
				where: { id: user.id },
				returning: true,
				plain: true,
				raw: true,
			},
		);
	}
	delete user.password;

	return user;
}

export default {
	loginUserWithEmailAndPassword,
};
