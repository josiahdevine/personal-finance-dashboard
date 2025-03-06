import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

export interface BaseApiError {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: BaseApiError;
}

export const handleApiError = (error: unknown, res: NextApiResponse) => {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
    });
  }

  if (error instanceof Error) {
    // Handle known error types
    switch (error.name) {
      case 'UnauthorizedError':
        return res.status(401).json({
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        });
      case 'NotFoundError':
        return res.status(404).json({
          error: {
            message: error.message || 'Resource not found',
            code: 'NOT_FOUND',
          },
        });
      case 'ConflictError':
        return res.status(409).json({
          error: {
            message: error.message || 'Resource conflict',
            code: 'CONFLICT',
          },
        });
      default:
        // Log unexpected errors but don't expose details to client
        return res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
    }
  }

  // Handle unknown error types
  return res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
  });
};

export class ApiError extends Error implements BaseApiError {
  public readonly code: string;

  constructor(
    message: string,
    public readonly statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = errorCode;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export const withErrorHandling = (handler: ApiHandler): ApiHandler => async (req, res) => {
  try {
    return await handler(req, res);
  } catch (error) {
    return handleApiError(error, res);
  }
}; 