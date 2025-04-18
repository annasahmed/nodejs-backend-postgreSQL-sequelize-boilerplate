const Joi = require('@hapi/joi');

const createNotification = Joi.object({
	title: Joi.string().required(),
	description: Joi.string().required(),
	image: Joi.any().optional(),
	place_id: Joi.allow(null).optional(),
	scheduled_at: Joi.date().optional().allow(null),
	is_scheduled: Joi.boolean().optional(),
});

const updateNotification = Joi.object({
	title: Joi.string().optional(),
	description: Joi.string().optional(),
	image: Joi.any().optional(),
	place_id: Joi.number().integer().optional(),
	scheduled_at: Joi.date().optional().allow(null),
	is_scheduled: Joi.boolean().optional(),
}).min(1);

const validateCreateNotification = (req, res, next) => {
	const { error } = createNotification.validate(req.body);

	if (error) {
		return res.status(400).json({ errors: error.details });
	}

	next();
};

const validateUpdateNotification = (req, res, next) => {
	const { error } = updateNotification.validate(req.body);

	if (error) {
		return res.status(400).json({ errors: error.details });
	}

	next();
};
export default {
	validateCreateNotification,
	validateUpdateNotification,
};
