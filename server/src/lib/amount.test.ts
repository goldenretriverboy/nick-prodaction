import { describe, expect, it } from 'vitest'
import { parseUsdAmount } from './amount.ts'

describe('parseUsdAmount', () => {
  it('parses integer and decimal amounts', () => {
    expect(parseUsdAmount('100')).toBe(100)
    expect(parseUsdAmount('100.5')).toBe(100.5)
    expect(parseUsdAmount('100,50')).toBe(100.5)
  })

  it('rejects negative, zero and invalid formats', () => {
    expect(parseUsdAmount('-1')).toBeNull()
    expect(parseUsdAmount('0')).toBeNull()
    expect(parseUsdAmount('12.345')).toBeNull()
    expect(parseUsdAmount('abc')).toBeNull()
  })
})
