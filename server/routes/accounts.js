import express from 'express';
import AccountController from '../controllers/AccountController.js';
import validate from '../middleware/validate.js';
import { 
  dateRangeSchema, 
  idParamSchema, 
  commaSeparatedListSchema,
  booleanFlagSchema
} from '../schemas/common.js';
import Joi from 'joi';

const router = express.Router();

// Account list schema
const getAccountsSchema = {
  query: Joi.object({
    include_hidden: booleanFlagSchema('include_hidden').default(false),
    type: Joi.alternatives().try(
      Joi.string(),
      commaSeparatedListSchema('type')
    ).messages({
      'alternatives.types': 'type must be a string or comma-separated list'
    }),
    search: Joi.string().max(100).messages({
      'string.base': 'Search term must be a string',
      'string.max': 'Search term cannot exceed 100 characters'
    }),
    institution_id: Joi.string().messages({
      'string.base': 'institution_id must be a string'
    })
  })
};

// Account settings update schema
const updateAccountSettingsSchema = {
  params: Joi.object(idParamSchema),
  body: Joi.object({
    is_hidden: Joi.boolean().messages({
      'boolean.base': 'is_hidden must be a boolean'
    }),
    name: Joi.string().max(100).messages({
      'string.base': 'Name must be a string',
      'string.max': 'Name cannot exceed 100 characters'
    })
  }).min(1).messages({
    'object.min': 'At least one field to update is required'
  })
};

// Account balance history schema
const getBalanceHistorySchema = {
  query: Joi.object({
    ...dateRangeSchema,
    account_ids: Joi.string().required().messages({
      'string.base': 'account_ids must be a string',
      'any.required': 'account_ids is required'
    })
  })
};

// Get accounts
router.get(
  '/',
  validate(getAccountsSchema),
  AccountController.getAccounts
);

// Get account by id
router.get(
  '/:id',
  validate({ params: Joi.object(idParamSchema) }),
  AccountController.getAccountById
);

// Update account settings
router.patch(
  '/:id/settings',
  validate(updateAccountSettingsSchema),
  AccountController.updateAccountSettings
);

// Get balance history
router.get(
  '/balance-history',
  validate(getBalanceHistorySchema),
  AccountController.getBalanceHistory
);

// Sync accounts
router.post(
  '/sync',
  AccountController.syncAccounts
);

export default router; 