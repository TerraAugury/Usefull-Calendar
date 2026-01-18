import {
  buildImportedFlight,
  collectFlightsForPax,
  dedupeImportedFlights,
  extractPaxNames,
} from '../utils/trip'

const sampleTrips = [
  {
    name: 'Family Trip',
    records: [
      {
        recordType: 'flight',
        paxNames: ['Alice Smith', 'Bob Smith'],
        pnr: 'PNR1',
        flight: { airline: { name: 'Airline', iata: 'BA' }, flightNumber: 'BA0664' },
        route: {
          departure: { iata: 'LHR', scheduled: '2026-01-10T08:00+00:00' },
          arrival: { iata: 'LCA', scheduled: '2026-01-10T14:00+02:00' },
        },
      },
      {
        recordType: 'hotel',
        paxNames: ['Alice Smith'],
      },
    ],
  },
  {
    name: 'Work Trip',
    records: [
      {
        paxNames: ['Marta Cruz'],
        pnr: null,
        flightDate: '2026-02-02',
        route: {
          flightNumber: 'BA123',
          airline: 'British Airways',
          departure: { iata: 'LHR', scheduled: '2026-02-02T09:30' },
          arrival: { iata: 'LCA', scheduled: '2026-02-02T15:30' },
        },
      },
    ],
  },
]

describe('trip import helpers', () => {
  it('extracts unique pax names from trip data', () => {
    expect(extractPaxNames(sampleTrips)).toEqual([
      'Alice Smith',
      'Bob Smith',
      'Marta Cruz',
    ])
  })

  it('collects flights for a selected pax', () => {
    const flights = collectFlightsForPax(sampleTrips, 'Alice Smith')
    expect(flights).toHaveLength(1)
    expect(flights[0].flightNumber).toBe('BA0664')
  })

  it('imports flights for the selected pax from shape B records', () => {
    const flights = collectFlightsForPax(sampleTrips, 'Marta Cruz')
    expect(flights).toHaveLength(1)
    const result = buildImportedFlight(flights[0], 'Marta Cruz')
    expect(result).not.toBeNull()
    expect(result.appointment.title).toContain('BA123')
    expect(result.appointment.timeMode).toBe('timezone')
  })

  it('dedupes imported flights by pax/date/flight number', () => {
    const flights = [
      { paxName: 'Alice Smith', flightDate: '2026-01-10', flightNumber: 'BA0664' },
      { paxName: 'Alice Smith', flightDate: '2026-01-10', flightNumber: 'BA0664' },
    ]
    const deduped = dedupeImportedFlights(flights)
    expect(deduped).toHaveLength(1)
  })
})
