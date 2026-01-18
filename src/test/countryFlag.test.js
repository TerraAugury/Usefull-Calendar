import { countryCodeToFlagEmoji } from '../data/airports'

describe('countryCodeToFlagEmoji', () => {
  it('returns a flag emoji for valid ISO2 code', () => {
    expect(countryCodeToFlagEmoji('CY')).toBe('\u{1F1E8}\u{1F1FE}')
  })

  it('returns empty string for invalid codes', () => {
    expect(countryCodeToFlagEmoji('UN')).toBe('')
    expect(countryCodeToFlagEmoji('')).toBe('')
  })
})
