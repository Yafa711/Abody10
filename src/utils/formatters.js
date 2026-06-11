// Formatting functions for displaying data to users
// Following the Simplicity principle: each function does one thing well
// Following the No Type Ignores principle: proper TypeScript definitions

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} [currencyCode='USD'] - The currency code (default: USD)
 * @returns {string} Formatted currency string
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 * formatCurrency(1234.5, 'EUR') // "€1,234.50"
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }

  const locale = currencyCode === 'SAR' ? 'ar-SA' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date for display
 * @param {string|number|Date} date - The date to format
 * @param {Object} [options] - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 * @example
 * formatDate('2023-05-15') // "May 15, 2023"
 */
export function formatDate(date, options = {}) {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Format a phone number
 * @param {string} phoneNumber - The phone number to format
 * @param {string} [countryCode='US'] - The country code (default: US)
 * @returns {string} Formatted phone number
 * @example
 * formatPhoneNumber('1234567890') // "(123) 456-7890"
 */
export function formatPhoneNumber(phoneNumber, countryCode = 'US') {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Basic US phone number formatting (can be extended for other countries)
  if (countryCode === 'US' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // For other countries or invalid lengths, return as-is
  return phoneNumber;
}

/**
 * Truncate text to a maximum length and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} [ellipsis='...'] - The string to append when truncated (default: '...')
 * @returns {string} Truncated string
 * @example
 * truncateText('Hello world', 8) // "Hello wo..."
 */
export function truncateText(text, maxLength, ellipsis = '...') {
  if (!text || typeof text !== 'string') return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize the first letter of a string
 * @param {string} text - The text to capitalize
 * @returns {string} Text with first letter capitalized
 * @example
 * capitalize('hello') // "Hello"
 */
export function capitalize(text) {
  if (!text || typeof text !== 'string') return '';

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to Title Case
 * @param {string} text - The text to convert
 * @returns {string} Text in Title Case
 * @example
 * toTitleCase('hello world') // "Hello World"
 */
export function toTitleCase(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}