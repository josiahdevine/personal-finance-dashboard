import { ApiError, ApiResponse } from '../types/index';

export class AppError extends Error {
  public code: string;
  public details?: Record<string, unknown>;
  public retry?: () => Promise<void>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ApiResponseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'API_ERROR', details);
    this.name = 'ApiResponseError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
}

interface ErrorHandlerConfig {
  retry?: RetryConfig;
  fallback?: unknown;
  onError?: (error: AppError) => void;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000
};

export const handleApiError = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  config: ErrorHandlerConfig = {}
): Promise<T> => {
  const retryConfig = {
    ...defaultRetryConfig,
    ...config.retry
  };

  let lastError: AppError | null = null;
  let attempt = 0;

  while (attempt < retryConfig.maxAttempts) {
    try {
      const response = await apiCall();
      
      if (response && typeof response === 'object' && 'success' in response && !response.success) {
        throw new ApiResponseError(
          response.error?.message || 'API request failed',
          {
            statusCode: response.error?.code,
            details: response.error?.details
          }
        );
      }

      if (response === undefined) {
        throw new Error('Response is undefined');
      }

      const data = 'data' in response && response.data !== undefined ? response.data : response;
      return data as T;
    } catch (error) {
      attempt++;
      
      if (error instanceof AppError) {
        lastError = error;
      } else if (error instanceof Error) {
        lastError = new NetworkError(error.message, {
          originalError: error
        });
      } else {
        lastError = new AppError(
          'An unexpected error occurred',
          'UNKNOWN_ERROR',
          { originalError: error }
        );
      }

      if (config.onError) {
        config.onError(lastError);
      }

      if (attempt < retryConfig.maxAttempts) {
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt - 1),
          retryConfig.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  if (config.fallback !== undefined) {
    return config.fallback as T;
  }

  throw lastError!;
};

export const createErrorHandler = (defaultConfig: ErrorHandlerConfig = {}) => {
  return async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    config: ErrorHandlerConfig = {}
  ): Promise<T> => {
    return handleApiError(apiCall, {
      ...defaultConfig,
      ...config,
      retry: {
        ...defaultConfig.retry,
        ...config.retry
      }
    });
  };
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isApiError = (error: unknown): error is ApiResponseError => {
  return error instanceof ApiResponseError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
};

export const createRetryableError = (
  error: AppError,
  retryFn: () => Promise<void>
): AppError => {
  error.retry = retryFn;
  return error;
};
