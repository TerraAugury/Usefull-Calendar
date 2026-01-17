import { buildUtcFields, zonedDateTimeToUtcMs } from '../utils/dates'

describe('date utilities', () => {
  it('computes local UTC milliseconds from local date and time', () => {
    const { startUtcMs } = buildUtcFields({
      date: '2026-01-10',
      startTime: '10:30',
      endTime: '',
      timeMode: 'local',
    })
    const expected = new Date(2026, 0, 10, 10, 30, 0, 0).getTime()
    expect(startUtcMs).toBe(expected)
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
})
