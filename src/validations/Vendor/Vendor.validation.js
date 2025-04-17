const Joi = require('@hapi/joi')

// Validation schema for creating a vendor
const createVendor = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().optional().allow(null),
  password: Joi.string().optional().allow(null),
  contact_person_name: Joi.string().optional().allow(null),
  trn_number: Joi.string().optional().allow(null),
  start_date: Joi.date().optional().allow(null),
  grace_period: Joi.number().integer().optional().default(15),
  status: Joi.boolean().required(),
})

// Validation schema for updating a vendor
const updateVendor = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().optional().allow(null),
  password: Joi.string().optional().allow(null),
  contact_person_name: Joi.string().optional().allow(null),
  trn_number: Joi.string().optional().allow(null),
  start_date: Joi.date().optional().allow(null),
  grace_period: Joi.number().integer().optional(),
  status: Joi.boolean().required(),
});

// Middleware to validate the request body against the schema for creating a vendor
const validateCreateVendor = (req, res, next) => {
  const { error } = createVendor.validate(req.body)

  if (error) {
    return res.status(400).json({ errors: error.details })
  }

  next()
}

// Middleware to validate the request body against the schema for updating a vendor
const validateUpdateVendor = (req, res, next) => {
  const { error } = updateVendor.validate(req.body)

  if (error) {
    return res.status(400).json({ errors: error.details })
  }

  next()
}

module.exports = {
  validateCreateVendor,
  validateUpdateVendor,
}
