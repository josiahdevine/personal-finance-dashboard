/**
 * This file provides direct overrides for problematic date-fns modules
 * to avoid the "conflicting star exports" error
 */

// We create a modified version of the problematic exports
export const longFormatters = {
  p: (_, options) => options && options.width === 'narrow' ? 'a' : 'am/pm',
  P: (_, options) => options && options.width === 'narrow' ? 'A' : 'AM/PM'
};

// Other potentially conflicting exports
export const parse = (str, format, baseDate, options) => {
  // Simplified implementation using Date
  return new Date(str);
};

export const format = (date, formatStr, options) => {
  // Simplified implementation
  return new Date(date).toLocaleDateString();
};

// Default export to satisfy both named and default imports
export default {
  longFormatters,
  parse,
  format
}; 