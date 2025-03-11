import express from 'express';
import TransactionController from '../controllers/TransactionController.js';
import validate from '../middleware/validate.js';
import { 
  dateRangeSchema, 
  paginationSchema, 
  idParamSchema, 
  commaSeparatedListSchema 
} from '../schemas/common.js';
import Joi from 'joi';

const router = express.Router();

// Transaction list schema
const getTransactionsSchema = {
  query: Joi.object({
    ...dateRangeSchema,
    ...paginationSchema,
    account_ids: commaSeparatedListSchema('account_ids'),
    categories: commaSeparatedListSchema('categories'),
    search: Joi.string().max(100).messages({
      'string.base': 'Search term must be a string',
      'string.max': 'Search term cannot exceed 100 characters'
    })
  })
};

// Transaction update schema
const updateTransactionSchema = {
  params: Joi.object(idParamSchema),
  body: Joi.object({
    category: Joi.string().max(50).messages({
      'string.base': 'Category must be a string',
      'string.max': 'Category cannot exceed 50 characters'
    }),
    notes: Joi.string().max(500).allow('').messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes cannot exceed 500 characters'
    }),
    tags: Joi.array().items(Joi.string().max(30)).max(10).messages({
      'array.base': 'Tags must be an array',
      'array.max': 'Cannot have more than 10 tags',
      'string.max': 'Each tag cannot exceed 30 characters'
    })
  }).min(1).messages({
    'object.min': 'At least one field to update is required'
  })
};

// Transaction category summary schema
const getCategorySummarySchema = {
  query: Joi.object({
    ...dateRangeSchema,
    account_ids: commaSeparatedListSchema('account_ids')
  })
};

// Transaction monthly trends schema
const getMonthlyTrendsSchema = {
  query: Joi.object({
    ...dateRangeSchema,
    account_ids: commaSeparatedListSchema('account_ids')
  })
};

// Get transactions
router.get(
  '/',
  validate(getTransactionsSchema),
  TransactionController.getTransactions
);

// Get transaction by id
router.get(
  '/:id',
  validate({ params: Joi.object(idParamSchema) }),
  TransactionController.getTransactionById
);

// Update transaction
router.patch(
  '/:id',
  validate(updateTransactionSchema),
  TransactionController.updateTransaction
);

// Get category summary
router.get(
  '/summary/categories',
  validate(getCategorySummarySchema),
  TransactionController.getCategorySummary
);

// Get monthly trends
router.get(
  '/summary/monthly',
  validate(getMonthlyTrendsSchema),
  TransactionController.getMonthlyTrends
);

export default router; 