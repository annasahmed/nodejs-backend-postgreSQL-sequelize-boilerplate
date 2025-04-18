const Joi = require('@hapi/joi');
const { password } = require('./custom.validation');

const appRegister = {
	body: Joi.object().keys({
		email: Joi.string().required().email(),
		password: Joi.string().required().custom(password),
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		instagramId: Joi.string(),
		phoneNumber: Joi.string(),
		status: Joi.boolean().required(),
	}),
};
const register = {
	body: Joi.object().keys({
		email: Joi.string().required().email(),
		password: Joi.string().required().custom(password),
		image: Joi.string().required(),
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		roleId: Joi.number().required(),
	}),
};

const login = {
	body: Joi.object().keys({
		email: Joi.string().required(),
		password: Joi.string().required(),
	}),
};
const vendorLogin = {
	body: Joi.object().keys({
		username: Joi.string().required(),
		password: Joi.string().required(),
	}),
};

const forgotPassword = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
	}),
};
const changePassword = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		oldPassword: Joi.string().required(),
		password: Joi.string().required(),
		confirmPassword: Joi.string().required(),
	}),
};

const verifyOtp = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		otp: Joi.number().required(),
	}),
};
const resetPassword = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
		password: Joi.string().required().custom(password),
		confirmPassword: Joi.string().required().custom(password),
	}),
};

export default {
	register,
	appRegister,
	login,
	vendorLogin,
	forgotPassword,
	resetPassword,
	verifyOtp,
	changePassword,
};
