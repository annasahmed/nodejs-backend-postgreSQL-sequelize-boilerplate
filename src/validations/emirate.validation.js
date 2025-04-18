const Joi = require('@hapi/joi');
const { password } = require('./custom.validation');

const createEmirate = {
	body: Joi.object().keys({
		name: Joi.string().required(),
		label: Joi.string().required(),
		country: Joi.string().required(),
		userId: Joi.number().required(),
		statusId: Joi.number().required(),
	}),
};

const getUsers = {
	query: Joi.object().keys({
		firstName: Joi.string(),
		lastName: Joi.string(),
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
			password: Joi.string().custom(password),
			firstName: Joi.string(),
			lastName: Joi.string(),
			roleId: Joi.number(),
			image: Joi.string(),
		})
		.min(1),
};

const deleteUser = {
	params: Joi.object().keys({
		userId: Joi.string(),
	}),
};

export default {
	createEmirate,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
