import { debounce, isEmpty, deepClone, groupBy, getNestedValue, setNestedValue, isDeepEqual } from '../../utils/helpers'

describe('debounce', () => {
  jest.useFakeTimers()

  test('debounces function calls', () => {
    const fn = jest.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()

    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('throws for non-function', () => {
    expect(() => debounce('not a function', 100)).toThrow('First argument must be a function')
  })
})

describe('isEmpty', () => {
  test('returns true for null', () => {
    expect(isEmpty(null)).toBe(true)
  })

  test('returns true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  test('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true)
  })

  test('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  test('returns true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  test('returns false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false)
  })

  test('returns false for number', () => {
    expect(isEmpty(0)).toBe(false)
  })
})

describe('deepClone', () => {
  test('clones a simple object', () => {
    const original = { a: 1, b: 2 }
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  test('clones nested object', () => {
    const original = { a: { b: { c: 3 } } }
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned.a.b).not.toBe(original.a.b)
  })

  test('clones array', () => {
    const original = [1, 2, [3, 4]]
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  test('clones Date', () => {
    const original = new Date('2023-01-01')
    const cloned = deepClone(original)
    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
  })

  test('returns primitives as-is', () => {
    expect(deepClone(42)).toBe(42)
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone(null)).toBeNull()
  })
})

describe('groupBy', () => {
  test('groups by property key', () => {
    const items = [
      { city: 'NYC', name: 'A' },
      { city: 'LA', name: 'B' },
      { city: 'NYC', name: 'C' },
    ]
    const grouped = groupBy(items, 'city')
    expect(grouped.NYC).toHaveLength(2)
    expect(grouped.LA).toHaveLength(1)
  })
})

describe('getNestedValue', () => {
  test('gets nested value', () => {
    const obj = { a: { b: { c: 42 } } }
    expect(getNestedValue(obj, 'a.b.c')).toBe(42)
  })

  test('returns default for missing path', () => {
    expect(getNestedValue({}, 'a.b.c', 'default')).toBe('default')
  })
})

describe('setNestedValue', () => {
  test('sets nested value', () => {
    const obj = {}
    setNestedValue(obj, 'a.b.c', 42)
    expect(obj.a.b.c).toBe(42)
  })
})

describe('isDeepEqual', () => {
  test('returns true for identical objects', () => {
    expect(isDeepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true)
  })

  test('returns false for different objects', () => {
    expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false)
  })

  test('compares arrays', () => {
    expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(isDeepEqual([1, 2], [1, 3])).toBe(false)
  })

  test('compares dates', () => {
    expect(isDeepEqual(new Date('2023-01-01'), new Date('2023-01-01'))).toBe(true)
    expect(isDeepEqual(new Date('2023-01-01'), new Date('2024-01-01'))).toBe(false)
  })

  test('handles primitives', () => {
    expect(isDeepEqual(42, 42)).toBe(true)
    expect(isDeepEqual('hello', 'hello')).toBe(true)
    expect(isDeepEqual(null, null)).toBe(true)
  })
})
