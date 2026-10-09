import { describe, expect, it } from 'vitest'
import { isValidLength, recommendLength, quote } from './sizing'
import { getProduct } from './catalog'
import { validateDelivery } from './checkout'

describe('size recommendations', () => {
  it.each([
    [16.5, 'snug', 17],
    [16.5, 'comfortable', 17.5],
    [16.5, 'loose', 18],
    [20.5, 'loose', 22],
    [13, 'snug', 13.5],
  ] as const)('recommends %s cm with %s fit without clamping', (wrist, fit, expected) => {
    expect(recommendLength(wrist, fit)).toBe(expected)
  })
  it.each([0, -2, NaN, Infinity, 16.25])('rejects invalid circumference %s', (wrist) => {
    expect(() => recommendLength(wrist, 'comfortable')).toThrow()
  })
  it.each([15, 15.5, 17.5, 20.5, 21])('accepts supported length %s', (length) => {
    expect(isValidLength(length)).toBe(true)
  })
  it.each([14.5, 21.5, 17.25, NaN, Infinity])('blocks unsupported length %s', (length) => {
    expect(isValidLength(length)).toBe(false)
  })
})

describe('product quotes', () => {
  it.each([
    ['earth', 39000],
    ['industry', 49000],
    ['amber', 45000],
    ['fragment', 47000],
  ])('quotes %s at one price for every supported length', (code, expected) => {
    for (let length = 15; length <= 21; length += 0.5) {
      expect(quote(getProduct(code)!, length)).toBe(expected)
    }
  })
  it('refuses to quote an out-of-range configuration', () => {
    expect(() => quote(getProduct('earth')!, 22)).toThrow()
  })
})

describe('checkout validation', () => {
  const input = {
    recipient: '데모 사용자',
    phone: '010-0000-0000',
    postalCode: '04524',
    address: '데모시 데모로 10',
    detail: '',
    terms: true,
    privacy: true,
    production: true,
  }
  it('accepts a complete delivery form', () => {
    expect(validateDelivery(input)).toEqual({})
  })
  it('requires independently accepted acknowledgements', () => {
    expect(
      validateDelivery({ ...input, terms: false, privacy: false, production: false }),
    ).toHaveProperty('terms')
    expect(validateDelivery({ ...input, privacy: false })).toHaveProperty('privacy')
    expect(validateDelivery({ ...input, production: false })).toHaveProperty('production')
  })
  it('rejects whitespace and invalid delivery formats', () => {
    const errors = validateDelivery({
      ...input,
      recipient: ' ',
      phone: '123',
      postalCode: 'abc',
      address: ' ',
    })
    expect(Object.keys(errors).sort()).toEqual(['address', 'phone', 'postalCode', 'recipient'])
  })
})
