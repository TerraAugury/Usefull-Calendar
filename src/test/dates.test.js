import { buildUtcFields, getTodayYYYYMMDD, zonedDateTimeToUtcMs } from '../utils/dates'

describe('date utilities', () => {
  it('computes UTC milliseconds for Europe/London date and time', () => {
    const { startUtcMs } = buildUtcFields({
      date: '2026-01-10',
      startTime: '10:30',
      endTime: '',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
    })
    expect(startUtcMs).toBe(Date.UTC(2026, 0, 10, 10, 30, 0, 0))
  })

  it('rolls end time to the next day when endTime is earlier', () => {
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: '2026-01-30',
      startTime: '23:00',
      endTime: '00:40',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
    })
    expect(startUtcMs).toBe(Date.UTC(2026, 0, 30, 23, 0, 0, 0))
    expect(endUtcMs).toBe(Date.UTC(2026, 0, 31, 0, 40, 0, 0))
  })

  it('converts Europe/London in winter (GMT) to UTC', () => {
    const utcMs = zonedDateTimeToUtcMs({
      dateStr: '2026-01-15',
      timeStr: '12:00',
      timeZone: 'Europe/London',
    })
    expect(utcMs).toBe(Date.UTC(2026, 0, 15, 12, 0, 0, 0))
  })

  it('converts Europe/Paris in summer (DST) to UTC', () => {
    const utcMs = zonedDateTimeToUtcMs({
      dateStr: '2026-07-15',
      timeStr: '12:00',
      timeZone: 'Europe/Paris',
    })
    expect(utcMs).toBe(Date.UTC(2026, 6, 15, 10, 0, 0, 0))
  })

  it('returns today for timezone mode', () => {
    const now = new Date(Date.UTC(2026, 0, 10, 23, 30, 0, 0))
    expect(
      getTodayYYYYMMDD({ mode: 'timezone', timeZone: 'Europe/Paris', now }),
    ).toBe('2026-01-11')
  })
})
