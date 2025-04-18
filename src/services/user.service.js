import httpStatus from 'http-status'
const { getOffset } = require('../utils/query');
import ApiError from '../utils/ApiError';
const { encryptData } = require('../utils/auth').default;
const config = require('../config/config.js');
import db from '../db/models'
const roleService = require('./role.service');
const { refactorCode } = require('../utils/globals.js');
const { Op } = require('sequelize');
import dayjs from 'dayjs'
const { imageService } = require('./index');
const { uploadToS3 } = require('./image.service');
const { default: axios } = require('axios');

async function getUserByEmail(email) {
	const user = await db.user.findOne({
		where: { email, status: true },
		raw: true,
	});

	return user;
}

async function getAppUserByEmail(email) {
	const user = await db.appUser.findOne({
		where: { email, status: true },
		raw: true,
	});

	return user;
}
async function getAllAppUserByEmail(email) {
	const user = await db.appUser.findOne({
		where: { email },
		raw: true,
	});

	return user;
}

async function getUserById(id) {
	const user = await db.user.findOne({
		where: { id },
		raw: true,
	});
	return user;
}

async function createUser(req) {
	const { email, first_name, last_name, password, roleId, status } = req.body;
	const hashedPassword = await encryptData(password);
	const user = await getUserByEmail(email);

	if (user) {
		throw new ApiError(httpStatus.CONFLICT, 'This email already exits');
	}

	const role = await roleService.getRoleById(roleId);

	if (!role) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
	}
	if (!req.files?.image[0]) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Image is required');
	}
	const date = dayjs();
	const file = req.files?.image[0];
	const extension = file.originalname.split('.').pop().toLowerCase();
	const path = `users/${date.year()}/${date.month()}/${date.date()}/${date.unix()}.${extension}`;
	const image = await uploadToS3(file.buffer, path);
	return await db.user
		.create({
			first_name,
			last_name,
			email,
			image,
			status,
			role_id: roleId,
			password: hashedPassword,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));
}

async function createAppUser(req) {
	const {
		email,
		firstName,
		lastName,
		password,
		instagramId,
		phoneNumber,
		status,
		is_social,
	} = req.body;
	const hashedPassword = password ? await encryptData(password) : null;
	const user = await getAllAppUserByEmail(email);

	if (user) {
		throw new ApiError(httpStatus.CONFLICT, 'This email already exits');
	}

	const createdAppUser = await db.appUser
		.create({
			first_name: firstName,
			last_name: lastName,
			email,
			status: true,
			instagram_id: instagramId,
			phone_number: phoneNumber,
			password: hashedPassword,
			is_social: is_social || false,
		})
		.then((resultEntity) => resultEntity.get({ plain: true }));

	return createdAppUser;
}

async function getUsers(req) {
	const { page: defaultPage, limit: defaultLimit } = config.pagination;
	const { page = defaultPage, limit = defaultLimit, search = '' } = req.query;

	const offset = getOffset(page, limit);

	const { count, rows } = await db.user.findAndCountAll({
		order: [['id', 'DESC']],
		include: [
			{
				model: db.role,
				require: true,
				// as: 'role',
				attributes: ['id', 'name'],
			},
		],
		where: {
			[Op.or]: [
				{
					first_name: {
						[Op.iLike]: `%${search}%`,
					},
				},
				{
					last_name: {
						[Op.iLike]: `%${search}%`,
					},
				},
				{
					email: {
						[Op.iLike]: `%${search}%`,
					},
				},
			],
		},
		attributes: [
			'id',
			'first_name',
			'last_name',
			'email',
			'status',
			'isLogged',
			'created_date_time',
			'modified_date_time',
		],
		offset,
		limit,
	});
	return {
		total: count,
		page: parseInt(page),
		data: rows,
		limit: limit,
	};
}

async function deleteUserById(userId) {
	const deletedUser = await db.user.destroy({
		where: { id: userId },
	});

	if (!deletedUser) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
	}

	return deletedUser;
}

async function updateUser(req) {
	const { password, email, first_name, last_name } = req.body;
	if (password) {
		const hashedPassword = await encryptData(password);

		if (!hashedPassword) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				'Internal Server Error',
			);
		}

		req.body.password = hashedPassword;
	} else {
		delete req.body.password;
	}

	if (email) {
		const existedUser = await db.user.findOne({
			where: {
				email,
				id: {
					[Op.not]: req.params.userId || req.body.id,
				},
			},
			raw: true,
		});

		if (existedUser) {
			throw new ApiError(
				httpStatus.CONFLICT,
				'This email is already exist',
			);
		}
	}
	if (first_name) {
		req.body.first_name = first_name;
	}
	if (last_name) {
		req.body.last_name = last_name;
	}
	let path = null;
	if (req.files?.image[0]) {
		const date = dayjs();
		const file = req.files?.image[0];
		const extension = file.originalname.split('.').pop().toLowerCase();
		path = `users/${date.year()}/${date.month()}/${date.date()}/${date.unix()}.${extension}`;
		req.body.image = await uploadToS3(file.buffer, path);
	} else {
		delete req.body.image;
	}
	return await db.user.update(
		{ ...req.body },
		{
			where: { id: req.params.userId || req.body.id },
		},
	);
}

export default {
	getUserByEmail,
	getAppUserByEmail,
	getUserById,
	createUser,
	createAppUser,
	updateUser,
	getUsers,
	deleteUserById,
};
