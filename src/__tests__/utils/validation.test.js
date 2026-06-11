import { isValidEmail, isValidPassword, isValidPhone, isNotEmpty, isAlphaOnly, isInRange, validateForm } from '../../utils/validation'

describe('isValidEmail', () => {
  test('valid email returns true', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  test('invalid email returns false', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
  })

  test('non-string returns false', () => {
    expect(isValidEmail(null)).toBe(false)
  })
})

describe('isValidPassword', () => {
  test('strong password returns true', () => {
    expect(isValidPassword('Strong1Pass')).toBe(true)
  })

  test('weak password returns false', () => {
    expect(isValidPassword('weak')).toBe(false)
  })

  test('missing number returns false', () => {
    expect(isValidPassword('NoNumberHere')).toBe(false)
  })
})

describe('isValidPhone', () => {
  test('10-digit number returns true', () => {
    expect(isValidPhone('1234567890')).toBe(true)
  })

  test('formatted number returns true', () => {
    expect(isValidPhone('123-456-7890')).toBe(true)
  })

  test('short number returns false', () => {
    expect(isValidPhone('12345')).toBe(false)
  })
})

describe('isNotEmpty', () => {
  test('non-empty string returns true', () => {
    expect(isNotEmpty('hello')).toBe(true)
  })

  test('empty string returns false', () => {
    expect(isNotEmpty('')).toBe(false)
  })

  test('null returns false', () => {
    expect(isNotEmpty(null)).toBe(false)
  })
})

describe('isAlphaOnly', () => {
  test('letters only returns true', () => {
    expect(isAlphaOnly('John Doe')).toBe(true)
  })

  test('letters with numbers returns false', () => {
    expect(isAlphaOnly('John123')).toBe(false)
  })
})

describe('isInRange', () => {
  test('value in range returns true', () => {
    expect(isInRange(5, 1, 10)).toBe(true)
  })

  test('value below range returns false', () => {
    expect(isInRange(0, 1, 10)).toBe(false)
  })

  test('non-number returns false', () => {
    expect(isInRange('abc', 1, 10)).toBe(false)
  })
})

describe('validateForm', () => {
  test('returns empty errors for valid data', () => {
    const values = { email: 'test@example.com', password: 'Strong1Pass' }
    const rules = {
      email: [{ validator: isValidEmail, message: 'Invalid email' }],
      password: [{ validator: isValidPassword, message: 'Weak password' }],
    }
    expect(validateForm(values, rules)).toEqual({})
  })

  test('returns errors for invalid data', () => {
    const values = { email: 'bad', password: 'weak' }
    const rules = {
      email: [{ validator: isValidEmail, message: 'Invalid email' }],
      password: [{ validator: isValidPassword, message: 'Weak password' }],
    }
    const errors = validateForm(values, rules)
    expect(errors.email).toBe('Invalid email')
    expect(errors.password).toBe('Weak password')
  })
})
