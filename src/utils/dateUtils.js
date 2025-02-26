/**
 * Date utility functions using dayjs to avoid date-fns conflicts
 * This file serves as a replacement for problematic date-fns imports
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Add plugins
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a date into a string with the specified format
 * @param {Date|string} date - The date to format
 * @param {string} formatString - The format string (default: 'MMM D, YYYY')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatString = 'MMM D, YYYY') => {
  if (!date) return '';
  return dayjs(date).format(formatString);
};

/**
 * Parses a date string into a Date object
 * @param {string} dateString - The date string to parse
 * @param {string} formatString - The format of the date string
 * @returns {Date} The parsed Date object
 */
export const parseDate = (dateString, formatString) => {
  if (!dateString) return null;
  return formatString 
    ? dayjs(dateString, formatString).toDate()
    : dayjs(dateString).toDate();
};

/**
 * Returns a friendly relative time string (e.g., "2 days ago")
 * @param {Date|string} date - The date to format
 * @returns {string} A relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

/**
 * Calculates the difference in days between two dates
 * @param {Date|string} dateA - First date
 * @param {Date|string} dateB - Second date (defaults to now)
 * @returns {number} Number of days between the dates
 */
export const getDaysDifference = (dateA, dateB = new Date()) => {
  return dayjs(dateB).diff(dayjs(dateA), 'day');
};

/**
 * Checks if a date is valid
 * @param {Date|string} date - The date to check
 * @returns {boolean} Whether the date is valid
 */
export const isValidDate = (date) => {
  return dayjs(date).isValid();
};

/**
 * Add the specified number of time units to the given date
 * @param {Date|string} date - The date to add to
 * @param {number} amount - The amount to add
 * @param {string} unit - The unit (day, week, month, year, etc.)
 * @returns {Date} The new date
 */
export const addToDate = (date, amount, unit) => {
  return dayjs(date).add(amount, unit).toDate();
};

/**
 * Subtract the specified number of time units from the given date
 * @param {Date|string} date - The date to subtract from
 * @param {number} amount - The amount to subtract
 * @param {string} unit - The unit (day, week, month, year, etc.)
 * @returns {Date} The new date
 */
export const subtractFromDate = (date, amount, unit) => {
  return dayjs(date).subtract(amount, unit).toDate();
};

/**
 * Get the start of a time unit for a date
 * @param {Date|string} date - The date to get the start of
 * @param {string} unit - The unit (day, week, month, year, etc.)
 * @returns {Date} The start date
 */
export const startOf = (date, unit) => {
  return dayjs(date).startOf(unit).toDate();
};

/**
 * Get the end of a time unit for a date
 * @param {Date|string} date - The date to get the end of
 * @param {string} unit - The unit (day, week, month, year, etc.)
 * @returns {Date} The end date
 */
export const endOf = (date, unit) => {
  return dayjs(date).endOf(unit).toDate();
};

// Export a default object with all functions
export default {
  format: formatDate,
  parse: parseDate,
  formatDate,
  parseDate,
  getRelativeTime,
  getDaysDifference,
  isValidDate,
  addToDate,
  subtractFromDate,
  startOf,
  endOf,
  dayjs,
  
  // Compatibility with date-fns function names
  formatDistance: getRelativeTime,
  parseISO: (str) => dayjs(str).toDate(),
  differenceInDays: getDaysDifference,
  isValid: isValidDate,
  add: addToDate,
  sub: subtractFromDate,
  
  // Add longFormatters to handle the specific conflict
  longFormatters: {
    p: () => 'AM/PM',
    P: () => 'am/pm',
  }
}; 