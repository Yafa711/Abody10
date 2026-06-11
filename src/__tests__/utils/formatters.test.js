import { formatCurrency, formatDate, formatPhoneNumber, truncateText, capitalize, toTitleCase } from '../../utils/formatters'

describe('formatCurrency', () => {
  test('formats number with default USD', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  test('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  test('formats with SAR currency', () => {
    const result = formatCurrency(100, 'SAR')
    expect(result).toContain('ر.س')
  })

  test('throws for non-number', () => {
    expect(() => formatCurrency('abc')).toThrow('Amount must be a valid number')
  })

  test('throws for NaN', () => {
    expect(() => formatCurrency(NaN)).toThrow('Amount must be a valid number')
  })
})

describe('formatDate', () => {
  test('formats date string', () => {
    const result = formatDate('2023-05-15')
    expect(result).toContain('May')
    expect(result).toContain('15')
    expect(result).toContain('2023')
  })

  test('throws for invalid date', () => {
    expect(() => formatDate('not-a-date')).toThrow('Invalid date provided')
  })
})

describe('formatPhoneNumber', () => {
  test('formats US 10-digit number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
  })

  test('returns as-is for non-US format', () => {
    expect(formatPhoneNumber('12345')).toBe('12345')
  })
})

describe('truncateText', () => {
  test('truncates long text with ellipsis', () => {
    expect(truncateText('Hello world', 8)).toBe('Hello...')
  })

  test('returns full text if within maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello')
  })

  test('returns empty for non-string', () => {
    expect(truncateText(null, 5)).toBe('')
  })
})

describe('capitalize', () => {
  test('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  test('returns empty for non-string', () => {
    expect(capitalize(null)).toBe('')
  })
})

describe('toTitleCase', () => {
  test('converts to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
  })

  test('returns empty for non-string', () => {
    expect(toTitleCase(null)).toBe('')
  })
})
