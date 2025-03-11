import Joi from 'joi';
import { logger } from '../utils/logger.js';

/**
 * Validate request using Joi schema
 */
function validate(schema) {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    };
    
    // Build the validation schema
    const schemaObj = {};
    
    if (schema.params) {
      schemaObj.params = schema.params;
    }
    
    if (schema.query) {
      schemaObj.query = schema.query;
    }
    
    if (schema.body) {
      schemaObj.body = schema.body;
    }
    
    // Create a combined schema
    const validationSchema = Joi.object(schemaObj);
    
    // Create an object to validate
    const obj = {};
    if (schema.params) obj.params = req.params;
    if (schema.query) obj.query = req.query;
    if (schema.body) obj.body = req.body;
    
    // Validate the request
    const { error, value } = validationSchema.validate(obj, validationOptions);
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));
      
      logger.warn('Validation error:', validationErrors);
      
      return res.status(400).json({
        error: 'Validation Error',
        validationErrors
      });
    }
    
    // Update the request with validated values
    if (schema.params) req.params = value.params;
    if (schema.query) req.query = value.query;
    if (schema.body) req.body = value.body;
    
    next();
  };
}

export default validate; 