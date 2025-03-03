/**
 * This file provides a wrapper for date-fns to avoid conflicting exports
 * between 'parse.js' and 'format.js' modules.
 */

// Import the specific functions we need from date-fns
import { format, parseISO, formatDistance, formatRelative, differenceInDays, isValid } from 'date-fns';

// Re-export the functions
export {
  format,
  parseISO,
  formatDistance,
  formatRelative,
  differenceInDays,
  isValid,
};

/**
 * Formats a date or date string into the specified format
 * @param {Date|string} date - The date to format
 * @param {string} formatString - The format string
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, formatString) : '';
  } catch (error) {
    
    return '';
  }
};

/**
 * Returns a friendly relative time string (e.g., "2 days ago")
 * @param {Date|string} date - The date to format
 * @param {Date} baseDate - The base date to compare against (defaults to now)
 * @returns {string} A relative time string
 */
export const getRelativeTime = (date, baseDate = new Date()) => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? formatDistance(parsedDate, baseDate, { addSuffix: true }) : '';
  } catch (error) {
    
    return '';
  }
};

export default {
  format,
  parseISO,
  formatDate,
  getRelativeTime,
  formatDistance,
  formatRelative,
  differenceInDays,
  isValid,
}; 