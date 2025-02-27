/**
 * Utility functions for formatting various data types
 */

/**
 * Format a number as currency with specified options
 * @param {number} value - The number to format as currency
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {number} minimumFractionDigits - Minimum fraction digits (default: 2)
 * @param {number} maximumFractionDigits - Maximum fraction digits (default: 2)
 * @returns {string} Formatted currency string
 */
export const currencyFormatter = (
  value, 
  currency = 'USD', 
  locale = 'en-US',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) => {
  // Handle null, undefined, or NaN values
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Format a number as a percentage
 * @param {number} value - Value to format as percentage (0.1 = 10%)
 * @param {number} minimumFractionDigits - Minimum fraction digits (default: 0)
 * @param {number} maximumFractionDigits - Maximum fraction digits (default: 2)
 * @returns {string} Formatted percentage string
 */
export const percentFormatter = (
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
) => {
  // Handle null, undefined, or NaN values
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Format a date with specified options
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string
 */
export const dateFormatter = (
  date,
  options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  },
  locale = 'en-US'
) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a number with commas as thousands separators
 * @param {number} value - Number to format
 * @param {number} minimumFractionDigits - Minimum fraction digits (default: 0)
 * @param {number} maximumFractionDigits - Maximum fraction digits (default: 2)
 * @returns {string} Formatted number with commas
 */
export const numberFormatter = (
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}; 