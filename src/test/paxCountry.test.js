import { getPaxCountryForDate } from '../utils/pax'

const flights = [
  {
    paxName: 'Alex',
    flightDate: '2026-01-10',
    flightNumber: 'BA100',
    fromIata: 'LHR',
    toIata: 'LCA',
    depScheduled: '2026-01-10T08:00',
    arrScheduled: '2026-01-10T14:00',
  },
  {
    paxName: 'Alex',
    flightDate: '2026-01-10',
    flightNumber: 'BA200',
    fromIata: 'LCA',
    toIata: 'ATH',
    depScheduled: '2026-01-10T18:00',
    arrScheduled: '2026-01-10T20:00',
  },
  {
    paxName: 'Alex',
    flightDate: '2026-01-12',
    flightNumber: 'BA300',
    fromIata: 'ATH',
    toIata: 'LHR',
    depScheduled: '2026-01-12T09:00',
    arrScheduled: '2026-01-12T11:00',
  },
]

describe('pax country per day', () => {
  it('follows departure and arrival rules across days', () => {
    expect(getPaxCountryForDate(flights, '2026-01-09').countryName).toBe(
      'United Kingdom',
    )
    expect(getPaxCountryForDate(flights, '2026-01-10').countryName).toBe(
      'United Kingdom',
    )
    expect(getPaxCountryForDate(flights, '2026-01-11').countryName).toBe(
      'Greece',
    )
    expect(getPaxCountryForDate(flights, '2026-01-12').countryName).toBe(
      'Greece',
    )
    expect(getPaxCountryForDate(flights, '2026-01-13').countryName).toBe(
      'United Kingdom',
    )
  })
})
