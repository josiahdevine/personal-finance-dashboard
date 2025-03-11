import Joi from 'joi';

// Common date range schema
export const dateRangeSchema = {
  start_date: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
    'any.required': 'Start date is required'
  }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
    'date.min': 'End date must be equal to or after start date',
    'any.required': 'End date is required'
  })
};

// Common pagination schema
export const paginationSchema = {
  limit: Joi.number().integer().min(1).max(100).default(25)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  offset: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'Offset must be a number',
      'number.integer': 'Offset must be an integer',
      'number.min': 'Offset must be at least 0'
    })
};

// Common ID parameter schema
export const idParamSchema = {
  id: Joi.string().required().messages({
    'string.base': 'ID must be a string',
    'any.required': 'ID is required'
  })
};

// Common comma-separated list schema
export const commaSeparatedListSchema = (fieldName) => 
  Joi.string().pattern(/^[a-zA-Z0-9_,]+$/).messages({
    'string.base': `${fieldName} must be a string`,
    'string.pattern.base': `${fieldName} must be a comma-separated list of alphanumeric values`
  });

// Common search term schema
export const searchTermSchema = {
  search: Joi.string().max(100).allow('').messages({
    'string.base': 'Search term must be a string',
    'string.max': 'Search term cannot exceed 100 characters'
  })
};

// Common boolean flag schema
export const booleanFlagSchema = (fieldName) =>
  Joi.boolean().messages({
    'boolean.base': `${fieldName} must be a boolean value (true/false)`
  });

// Common date schema
export const dateSchema = (fieldName) =>
  Joi.date().iso().messages({
    'date.base': `${fieldName} must be a valid date`,
    'date.format': `${fieldName} must be in ISO format (YYYY-MM-DD)`
  });

// Common UUID schema
export const uuidSchema = (fieldName) =>
  Joi.string().guid({ version: 'uuidv4' }).messages({
    'string.base': `${fieldName} must be a string`,
    'string.guid': `${fieldName} must be a valid UUID`
  }); 