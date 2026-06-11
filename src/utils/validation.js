// Validation functions for form inputs and data
// Following the Simplicity principle: each validator does one specific check
// Following the No Type Ignores principle: proper TypeScript definitions
// Following the DRY principle: centralize validation logic to avoid duplication

/**
 * Validate an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 * @example
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a password strength
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets requirements, false otherwise
 * @example
 * isValidPassword('weak') // false
 * isValidPassword('strongPassword123') // true
 */
export function isValidPassword(password) {
  if (typeof password !== 'string') return false;

  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate a phone number (US format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if phone number is valid, false otherwise
 * @example
 * isValidPhone('123-456-7890') // true
 * isValidPhone('1234567890') // true
 * isValidPhone('123-45-6789') // false
 */
export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // US phone number: 10 digits
  return digitsOnly.length === 10 && /^\d{10}$/.test(digitsOnly);
}

/**
 * Validate that a value is not empty
 * @param {*} value - The value to check
 * @returns {boolean} True if value is not empty, false otherwise
 * @example
 * isNotEmpty('hello') // true
 * isNotEmpty('') // false
 * isNotEmpty(null) // false
 * isNotEmpty(undefined) // false
 * isNotEmpty([]) // false
 */
export function isNotEmpty(value) {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') return value.trim().length > 0;

  if (Array.isArray(value)) return value.length > 0;

  if (typeof value === 'object') return Object.keys(value).length > 0;

  // For numbers, booleans, etc. - consider them not empty if they exist
  return true;
}

/**
 * Validate that a string contains only letters and spaces
 * @param {string} text - The text to validate
 * @returns {boolean} True if text contains only letters and spaces, false otherwise
 * @example
 * isAlphaOnly('John Doe') // true
 * isAlphaOnly('John123') // false
 */
export function isAlphaOnly(text) {
  if (typeof text !== 'string') return false;

  return /^[a-zA-Z\s]+$/.test(text);
}

/**
 * Validate that a value is within a specified range
 * @param {number} value - The value to check
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @returns {boolean} True if value is within range, false otherwise
 * @example
 * isInRange(5, 1, 10) // true
 * isInRange(0, 1, 10) // false
 * isInRange(15, 1, 10) // false
 */
export function isInRange(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) return false;
  if (typeof min !== 'number' || isNaN(min)) return false;
  if (typeof max !== 'number' || isNaN(max)) return false;

  return value >= min && value <= max;
}

/**
 * Validate form data against a set of rules
 * @param {Object} values - The form values to validate
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} Object containing field names as keys and error messages as values
 * @example
 * const values = { email: 'test@example.com', password: 'password123' };
 * const rules = {
 *   email: [{ validator: isValidEmail, message: 'Please enter a valid email' }],
 *   password: [{ validator: isValidPassword, message: 'Password must be at least 8 characters with uppercase, lowercase, and number' }]
 * };
 *
 * const errors = validateForm(values, rules);
 * // errors will be empty if all validations pass
 */
export function validateForm(values, rules) {
  if (!values || typeof values !== 'object') return {};
  if (!rules || typeof rules !== 'object') return {};

  const errors = {};

  for (const field in rules) {
    // Skip if field doesn't exist in values (might be optional)
    if (!(field in values)) continue;

    const value = values[field];
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];

    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break; // Stop checking rules for this field on first failure
      }
    }
  }

  return errors;
}