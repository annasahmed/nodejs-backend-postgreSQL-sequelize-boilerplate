const Joi = require('@hapi/joi');
const { password } = require('./custom.validation');

const createUser = {
	body: Joi.object().keys({
		email: Joi.string().email(),
		password: Joi.string().custom(password),
		first_name: Joi.string(),
		last_name: Joi.string(),
		roleId: Joi.number(),
		image: Joi.any().optional(),
		status: Joi.boolean()
	}),
};

const getUsers = {
	query: Joi.object().keys({
		first_name: Joi.string(),
		last_name: Joi.string(),
		email: Joi.string().email(),
		roleId: Joi.number(),
		limit: Joi.number().min(1),
		page: Joi.number().min(1),
	}),
};

const getUser = {
	params: Joi.object().keys({
		userId: Joi.string(),
	}),
};

const updateUser = {
	params: Joi.object().keys({
		userId: Joi.required(),
	}),
	body: Joi.object()
		.keys({
			email: Joi.string().email(),
			password: Joi.string().allow('').optional().custom(password),
			first_name: Joi.string(),
			last_name: Joi.string(),
			roleId: Joi.number(),
			image: Joi.any().optional(),
			status: Joi.boolean()
		})
		.min(1),
};

const deleteUser = {
	params: Joi.object().keys({
		userId: Joi.string(),
	}),
};

export default {
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
