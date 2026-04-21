import { describe, expect, it } from 'vitest'
import { parseKztAmount } from './amount.ts'

describe('parseKztAmount', () => {
  it('parses integer and decimal amounts', () => {
    expect(parseKztAmount('100')).toBe(100)
    expect(parseKztAmount('100.5')).toBe(100.5)
    expect(parseKztAmount('100,50')).toBe(100.5)
  })

  it('rejects negative, zero and invalid formats', () => {
    expect(parseKztAmount('-1')).toBeNull()
    expect(parseKztAmount('0')).toBeNull()
    expect(parseKztAmount('12.345')).toBeNull()
    expect(parseKztAmount('abc')).toBeNull()
  })
})
