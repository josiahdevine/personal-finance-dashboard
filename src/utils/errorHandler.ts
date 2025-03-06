export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(status: number, message: string, data: any = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: any, defaultMessage: string): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.data.details?.message || 'Invalid request data';
      case 401:
        return 'Authentication required';
      case 403:
        return 'You do not have permission for this action';
      case 404:
        return 'The requested resource was not found';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Our team has been notified';
      default:
        return error.message || defaultMessage;
    }
  }
  
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return 'Network connection error. Please check your internet connection';
  }
  
  return defaultMessage;
}; 