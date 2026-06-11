// Helper functions for common operations
// Following the Simplicity principle: each helper does one specific task
// Following the DRY principle: extract common logic to avoid duplication
// Following the Preferred Tools principle: use built-in JavaScript methods when possible

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} Debounced function
 * @example
 * const handleResize = debounce(() => {
 *   console.log('Window resized');
 * }, 250);
 *
 * window.addEventListener('resize', handleResize);
 */
export function debounce(func, wait) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (typeof wait !== 'number' || isNaN(wait) || wait < 0) {
    throw new Error('Wait must be a non-negative number');
  }

  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle a function call
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds between calls
 * @returns {Function} Throttled function
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scrolled');
 * }, 1000);
 *
 * window.addEventListener('scroll', handleScroll);
 */
export function throttle(func, limit) {
  if (typeof func !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (typeof limit !== 'number' || isNaN(limit) || limit < 0) {
    throw new Error('Limit must be a non-negative number');
  }

  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Create a deep copy of an object or array
 * @param {*} obj - The object or array to copy
 * @returns {*} Deep copy of the input
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const copy = deepClone(original);
 * // copy.a === 1
 * // copy.b.c === 2
 * // copy.b !== original.b (different objects)
 */
export function deepClone(obj) {
  // Handle null, undefined, and primitive types
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // Handle Object
  if (obj instanceof Object) {
    const copy = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = deepClone(obj[key]);
      }
    }
    return copy;
  }

  // Fallback (shouldn't reach here with proper typeof check)
  return obj;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - The value to check
 * @returns {boolean} True if value is considered empty, false otherwise
 * @example
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty(null) // true
 * isEmpty(undefined) // true
 * isEmpty('hello') // false
 * isEmpty([1]) // false
 * isEmpty({ a: 1 }) // false
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string') return value.trim().length === 0;

  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === 'object') return Object.keys(value).length === 0;

  // For numbers, booleans, etc. - consider them not empty
  return false;
}

/**
 * Group an array of objects by a specified key
 * @param {Array} array - The array to group
 * @param {string|Function} key - The key to group by (string for property name, function for custom grouping)
 * @returns {Object} Object with keys as group names and values as arrays of items
 * @example
 * const people = [
 *   { name: 'John', age: 30, city: 'New York' },
 *   { name: 'Jane', age: 25, city: 'Boston' },
 *   { name: 'Bob', age: 35, city: 'New York' }
 * ];
 *
 * groupBy(people, 'city') //
 * // {
 * //   New York: [{ name: 'John', ... }, { name: 'Bob', ... }],
 * //   Boston: [{ name: 'Jane', ... }]
 * // }
 *
 * groupBy(people, person => person.age >= 30 ? '30+' : 'under-30') //
 * // { '30+': [{ name: 'John', ... }, { name: 'Bob', ... }],
 * //   'under-30': [{ name: 'Jane', ... }] }
 */
export function groupBy(array, key) {
  if (!Array.isArray(array)) {
    throw new Error('First argument must be an array');
  }

  if (array.length === 0) return {};

  const isFunction = typeof key === 'function';

  return array.reduce((acc, item) => {
    const groupKey = isFunction ? key(item) : item[key];

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }

    acc[groupKey].push(item);
    return acc;
  }, {});
}

/**
 * Get a nested property value from an object using dot notation
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-separated path to the property (e.g., 'user.profile.name')
 * @param {*} [defaultValue] - Value to return if path doesn't exist
 * @returns {*} The property value or defaultValue if not found
 * @example
 * const user = { profile: { name: 'John', age: 30 } };
 *
 * getNestedValue(user, 'profile.name') // 'John'
 * getNestedValue(user, 'profile.address', 'Unknown') // 'Unknown'
 * getNestedValue(user, 'nonexistent', null) // null
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  if (!obj || typeof obj !== 'object') return defaultValue;

  if (!path || typeof path !== 'string') return defaultValue;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current;
}

/**
 * Set a nested property value in an object using dot notation
 * @param {Object} obj - The object to modify
 * @param {string} path - Dot-separated path to the property
 * @param {*} value - The value to set
 * @returns {Object} The modified object (also modifies original)
 * @example
 * const user = {};
 *
 * setNestedValue(user, 'profile.name', 'John');
 * // user is now { profile: { name: 'John' } }
 *
 * setNestedValue(user, 'settings.notifications.email', true);
 * // user is now { profile: { name: 'John' }, settings: { notifications: { email: true } } }
 */
export function setNestedValue(obj, path, value) {
  if (!obj || typeof obj !== 'object') {
    throw new Error('First argument must be an object');
  }

  if (!path || typeof path !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  const keys = path.split('.');
  let current = obj;

  // Navigate to the parent of the target property
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {};
    }

    current = current[key];
  }

  // Set the final property
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;

  return obj;
}

/**
 * Compare two values for deep equality
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} True if values are deeply equal, false otherwise
 * @example
 * isDeepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }) // true
 * isDeepEqual([1, 2, { a: 3 }], [1, 2, { a: 3 }]) // true
 * isDeepEqual('hello', 'hello') // true
 * isDeepEqual(5, 5) // true
 * isDeepEqual({ a: 1 }, { a: 2 }) // false
 */
export function isDeepEqual(a, b) {
  // Handle strict equality and null/undefined
  if (a === b) return true;

  // Handle null vs undefined or one being null/undefined
  if (a == null || b == null) return a === b;

  // Handle different types
  if (typeof a !== typeof b) return false;

  // Handle primitives (string, number, boolean, symbol, bigint)
  if (typeof a !== 'object') return a === b;

  // Handle Date
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle Array
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isDeepEqual(item, b[index]));
  }

  // Handle Object
  if (a instanceof Object && b instanceof Object) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(key =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isDeepEqual(a[key], b[key])
    );
  }

  // If we get here, they're not equal
  return false;
}