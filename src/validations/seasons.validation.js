const Joi = require('@hapi/joi');

// Validation for creating a new season
const createSeason = {
  body: Joi.object().keys({
    title: Joi.string().required().messages({
      'string.empty': 'Title is required',
      'any.required': 'Title is required',
    }),
    startDate: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().required().greater(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'End date is required',
      'date.greater': 'End date must be after the start date',
    }),
    status: Joi.boolean().optional().default(true),
  }),
};

// Validation for updating an existing season
const updateSeason = {
  params: Joi.object().keys({
    seasonId: Joi.number().integer().required().messages({
      'number.base': 'Season ID must be a number',
      'any.required': 'Season ID is required',
    }),
  }),
  body: Joi.object().keys({
    title: Joi.string().optional().messages({
      'string.empty': 'Title cannot be empty',
    }),
    startDate: Joi.date().iso().optional().messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
    }),
    endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.greater': 'End date must be after the start date',
    }),
    status: Joi.boolean().optional(),
  }),
};

// Validation for getting or deleting a season by ID
const seasonId = {
  params: Joi.object().keys({
    seasonId: Joi.number().integer().required().messages({
      'number.base': 'Season ID must be a number',
      'any.required': 'Season ID is required',
    }),
  }),
};

module.exports = {
  createSeason,
  updateSeason,
  seasonId,
};
