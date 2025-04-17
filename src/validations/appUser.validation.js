const Joi = require('@hapi/joi');
const { password } = require('./custom.validation');
const { search } = require('../routes/v1');

const createAppUser = {
	body: Joi.object().keys({
		email: Joi.string().required().email(),
		password: Joi.string().required().custom(password),
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
	}),
};

const getAppUsers = {
	query: Joi.object().keys({
		search: Joi.string(),
		// firstName: Joi.string(),
		// lastName: Joi.string(),
		// email: Joi.string().email(),
		roleId: Joi.number(),
		limit: Joi.number().min(1),
		page: Joi.number().min(1),
	}),
};

const getAppUser = {
	params: Joi.object().keys({
		userId: Joi.string(),
	}),
};

const updateAppUser = {
	params: Joi.object().keys({
		userId: Joi.required(),
	}),
	body: Joi.object()
		.keys({
			email: Joi.string().email(),
			password: Joi.string().custom(password),
			firstName: Joi.string(),
			lastName: Joi.string(),
			image: Joi.string(),
		})
		.min(1),
};

const deleteAppUser = {
	params: Joi.object().keys({
		userId: Joi.string(),
	}),
};

module.exports = {
	createAppUser,
	getAppUsers,
	getAppUser,
	updateAppUser,
	deleteAppUser,
};
