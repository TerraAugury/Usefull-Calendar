import { describe, expect, it } from 'vitest'
import {
  getInferredTimeZoneFromPax,
  resolveTimeZoneState,
} from '../utils/timezone'

describe('timezone inference', () => {
  it('infers Asia/Nicosia when pax country is Cyprus', () => {
    const paxFlights = [
      {
        paxName: 'Alex Smith',
        flightDate: '2026-01-10',
        fromIata: 'LCA',
        toIata: 'LHR',
        depScheduled: '2026-01-10T08:00:00+02:00',
      },
    ]
    const inferred = getInferredTimeZoneFromPax(paxFlights, '2026-01-10')
    expect(inferred).toBe('Asia/Nicosia')
  })

  it('falls back to device timezone when no pax country is available', () => {
    const resolved = resolveTimeZoneState({
      timeMode: 'timezone',
      dateStr: '2026-01-10',
      paxFlights: [],
      currentTimeZone: '',
      currentSource: '',
      deviceTimeZone: 'Europe/Paris',
    })

    expect(resolved).toEqual({
      timeZone: 'Europe/Paris',
      source: 'deviceFallback',
    })
  })
})
