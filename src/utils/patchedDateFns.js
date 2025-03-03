/**
 * Simple date formatting utility to replace date-fns and avoid circular dependencies
 * This implementation doesn't import from date-fns at all to prevent circular references
 */

// Simple date formatting function that doesn't rely on date-fns
export const format = (date, formatStr) => {
  // Make sure we have a valid date object
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  // Handle common format strings
  return formatStr
    .replace('MMMM', getMonthName(d.getMonth()))
    .replace('MMM', getMonthShortName(d.getMonth()))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('M', String(d.getMonth() + 1))
    .replace('yyyy', d.getFullYear())
    .replace('yy', String(d.getFullYear()).slice(-2))
    .replace('dd', String(d.getDate()).padStart(2, '0'))
    .replace('d', d.getDate())
    .replace('HH', String(d.getHours()).padStart(2, '0'))
    .replace('H', d.getHours())
    .replace('mm', String(d.getMinutes()).padStart(2, '0'))
    .replace('m', d.getMinutes())
    .replace('ss', String(d.getSeconds()).padStart(2, '0'))
    .replace('s', d.getSeconds());
};

// Helper function to get month names
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

// Helper function to get short month names
function getMonthShortName(monthIndex) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthIndex];
}

// Add basic date parsing
export const parseISO = (dateString) => {
  // Simple ISO date parsing
  return new Date(dateString);
};

// Simple function to check if a date is valid
export const isValid = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Export longFormatters to avoid conflicts
export const longFormatters = {
  p: () => 'AM/PM',
  P: () => 'am/pm'
};

const dateUtils = {
  format,
  parseISO,
  isValid,
  longFormatters
};

export default dateUtils; 