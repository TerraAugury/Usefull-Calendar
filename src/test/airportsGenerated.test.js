import { AIRPORTS } from '../data/airports.generated'
import { getAirportInfo } from '../data/airports'

describe('generated airports dataset', () => {
  it('includes Cyprus airports with Asia/Nicosia timezone', () => {
    expect(AIRPORTS.LCA).toBeDefined()
    expect(AIRPORTS.PFO).toBeDefined()
    expect(AIRPORTS.ECN).toBeDefined()
    expect(AIRPORTS.LCA.countryName).toBe('Cyprus')
    expect(AIRPORTS.LCA.timeZone).toBe('Asia/Nicosia')
    expect(AIRPORTS.PFO.timeZone).toBe('Asia/Nicosia')
    expect(AIRPORTS.ECN.timeZone).toBe('Asia/Nicosia')
  })

  it('includes well-known European airports', () => {
    expect(AIRPORTS.LHR).toBeDefined()
    expect(AIRPORTS.CDG).toBeDefined()
    expect(AIRPORTS.FRA).toBeDefined()
  })

  it('returns Unknown for missing IATA codes', () => {
    const info = getAirportInfo('ZZZ')
    expect(info.countryName).toBe('Unknown')
    expect(info.timeZone).toBe(null)
  })
})
