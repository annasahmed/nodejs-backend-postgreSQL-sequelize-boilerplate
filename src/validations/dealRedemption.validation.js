const Joi = require('@hapi/joi');

// Define the Joi schema
const dealRedeemSchema = Joi.object({
	dealId: Joi.number().integer().required(),
	placePin: Joi.any().required(),
	total: Joi.number().positive().required(),
	placeId: Joi.number().positive().required(),
});

// Middleware to validate the request body against the schema
const validateDealRedeem = (req, res, next) => {
	const { error } = dealRedeemSchema.validate(req.body);

	if (error) {
		return res.status(400).json({ errors: error.details });
	}

	next();
};

export default {
	validateDealRedeem,
};
