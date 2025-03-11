import {
  AppError,
  ValidationError,
  NetworkError,
  ApiResponseError,
  AuthenticationError,
  handleApiError,
  createErrorHandler,
  isAppError,
  isNetworkError,
  isApiError,
  isValidationError,
  isAuthError,
  getErrorMessage,
  getErrorCode,
  createRetryableError
} from '../errorHandling';

describe('Error Classes', () => {
  it('creates AppError with correct properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', { foo: 'bar' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.details).toEqual({ foo: 'bar' });
    expect(error.name).toBe('AppError');
  });

  it('creates ValidationError with correct properties', () => {
    const error = new ValidationError('Invalid data', { field: 'email' });
    expect(error.message).toBe('Invalid data');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ field: 'email' });
    expect(error.name).toBe('ValidationError');
  });

  it('creates NetworkError with correct properties', () => {
    const error = new NetworkError('Connection failed');
    expect(error.message).toBe('Connection failed');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.name).toBe('NetworkError');
  });
});

describe('handleApiError', () => {
  const mockSuccessResponse = {
    success: true,
    data: { id: 1 }
  };

  const mockErrorResponse = {
    success: false,
    error: {
      message: 'API Error',
      code: 400,
      details: { field: 'id' }
    }
  };

  it('returns data on successful response', async () => {
    const apiCall = jest.fn().mockResolvedValue(mockSuccessResponse);
    const result = await handleApiError(apiCall);
    expect(result).toEqual({ id: 1 });
  });

  it('throws ApiResponseError on unsuccessful response', async () => {
    const apiCall = jest.fn().mockResolvedValue(mockErrorResponse);
    await expect(handleApiError(apiCall)).rejects.toThrow(ApiResponseError);
  });

  it('retries on failure with exponential backoff', async () => {
    const apiCall = jest.fn()
      .mockRejectedValueOnce(new Error('Attempt 1'))
      .mockRejectedValueOnce(new Error('Attempt 2'))
      .mockResolvedValue(mockSuccessResponse);

    const result = await handleApiError(apiCall, {
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000
      }
    });

    expect(result).toEqual({ id: 1 });
    expect(apiCall).toHaveBeenCalledTimes(3);
  });

  it('returns fallback value when provided and all retries fail', async () => {
    const apiCall = jest.fn().mockRejectedValue(new Error('Failed'));
    const fallback = { id: 'fallback' };

    const result = await handleApiError(apiCall, {
      retry: { maxAttempts: 2 },
      fallback
    });

    expect(result).toEqual(fallback);
  });
});

describe('Error Type Guards', () => {
  it('correctly identifies error types', () => {
    const appError = new AppError('App error', 'APP_ERROR');
    const validationError = new ValidationError('Invalid data');
    const networkError = new NetworkError('Network failed');
    const apiError = new ApiResponseError('API failed');
    const authError = new AuthenticationError('Auth failed');
    const standardError = new Error('Standard error');

    expect(isAppError(appError)).toBe(true);
    expect(isAppError(standardError)).toBe(false);

    expect(isValidationError(validationError)).toBe(true);
    expect(isValidationError(appError)).toBe(false);

    expect(isNetworkError(networkError)).toBe(true);
    expect(isNetworkError(appError)).toBe(false);

    expect(isApiError(apiError)).toBe(true);
    expect(isApiError(appError)).toBe(false);

    expect(isAuthError(authError)).toBe(true);
    expect(isAuthError(appError)).toBe(false);
  });
});

describe('Error Utilities', () => {
  it('gets correct error message', () => {
    const appError = new AppError('App error', 'APP_ERROR');
    const standardError = new Error('Standard error');
    const unknownError = 'Not an error';

    expect(getErrorMessage(appError)).toBe('App error');
    expect(getErrorMessage(standardError)).toBe('Standard error');
    expect(getErrorMessage(unknownError)).toBe('An unexpected error occurred');
  });

  it('gets correct error code', () => {
    const appError = new AppError('App error', 'APP_ERROR');
    const standardError = new Error('Standard error');

    expect(getErrorCode(appError)).toBe('APP_ERROR');
    expect(getErrorCode(standardError)).toBe('UNKNOWN_ERROR');
  });

  it('creates retryable error', async () => {
    const error = new AppError('Retryable error', 'RETRY_ERROR');
    const retryFn = jest.fn();
    
    const retryableError = createRetryableError(error, retryFn);
    expect(retryableError.retry).toBeDefined();
    
    if (retryableError.retry) {
      await retryableError.retry();
      expect(retryFn).toHaveBeenCalled();
    }
  });
});

describe('createErrorHandler', () => {
  it('creates handler with default config', async () => {
    const defaultConfig = {
      retry: { maxAttempts: 2 },
      fallback: { default: true }
    };

    const handler = createErrorHandler(defaultConfig);
    const apiCall = jest.fn().mockResolvedValue({ success: true, data: { id: 1 } });

    const result = await handler(apiCall);
    expect(result).toEqual({ id: 1 });
  });

  it('allows overriding default config', async () => {
    const defaultConfig = {
      retry: { maxAttempts: 2 },
      fallback: { default: true }
    };

    const handler = createErrorHandler(defaultConfig);
    const apiCall = jest.fn().mockRejectedValue(new Error('Failed'));

    const result = await handler(apiCall, {
      fallback: { override: true }
    });

    expect(result).toEqual({ override: true });
  });
});
