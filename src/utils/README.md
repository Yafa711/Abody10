# Utility Functions

This directory contains pure helper functions that follow the **DRY** and **Simplicity** principles.

## Purpose

Utility functions extract common, reusable logic that doesn't belong to any specific component, hook, or service.

## Design Principles

### DRY Principle
- If you find yourself writing the same function in multiple places, extract it to a utility
- Examples: formatting dates, currency, text manipulation, validation, etc.
- This ensures consistency and reduces duplication

### Simplicity Principle
- Utilities should do one thing and do it well
- Functions should be pure (no side effects) whenever possible
- Keep functions small and focused
- Prefer multiple small utilities over one large utility doing many things

### No Type Ignores Principle
- All utilities should have proper TypeScript definitions
- Fix type issues rather than ignoring them with `// @ts-ignore`
- Use explicit return types and parameter types

## Utility Categories

### Formatters
- `formatters.js` - Functions for formatting data for display
  - `formatCurrency(amount)` - Format number as currency
  - `formatDate(date)` - Format date for display
  - `formatPhoneNumber(phone)` - Format phone number
  - `truncateText(text, maxLength)` - Truncate text with ellipsis

### Validators
- `validation.js` - Functions for validating input data
  - `isValidEmail(email)` - Validate email format
  - `isValidPassword(password)` - Validate password strength
  - `isValidPhone(phone)` - Validate phone number format
  - `validateForm(values, rules)` - Validate form against rules

### Helpers
- `helpers.js` - General purpose helper functions
  - `debounce(func, wait)` - Debounce function calls
  - `throttle(func, limit)` - Throttle function calls
  - `deepClone(obj)` - Create deep copy of object
  - `isEmpty(value)` - Check if value is empty
  - `groupBy(array, key)` - Group array items by key

### Constants
- `constants.js` - Application-wide constants
  - `API_ENDPOINTS` - API endpoint URLs
  - `ROLES` - User role definitions
  - `CATEGORIES` - Product categories
  - `PAYMENT_METHODS` - Accepted payment methods
  - `DEFAULT_PAGE_SIZE` - Default pagination size

## Usage Guidelines

1. **Keep utilities pure** - Avoid side effects when possible
2. **Make functions testable** - Pure functions are easiest to test
3. **Use descriptive names** - Function names should clearly indicate what they do
4. **Add proper TypeScript definitions** - Specify parameter and return types
5. **Handle edge cases** - Consider null, undefined, empty values, etc.
6. **Follow existing patterns** - Consistency with other utilities in the directory
7. **Document complex logic** - Add comments for non-obvious implementations
8. **Avoid dependencies on UI libraries** - Utilities should be framework-independent when possible
9. **Export individually** - Allow tree-shaking by exporting functions individually
10. **Group related functions** - Keep related utilities in the same file

## Example: formatters.js

```javascript
// Formatters for displaying data to users
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

## Example: validation.js

```javascript
// Validation functions for form inputs
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password) {
  // At least 8 chars, one letter, one number
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

export function validateForm(values, rules) {
  const errors = {};
  
  for (const field in rules) {
    const value = values[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  
  return errors;
}
```

## Testing Utilities

Utility functions should be unit tested using Jest or similar framework.
Tests should cover:
- Normal cases
- Edge cases (null, undefined, empty strings, etc.)
- Error conditions
- Type correctness