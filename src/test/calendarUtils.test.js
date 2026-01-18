import { formatDateYYYYMMDD } from '../utils/dates'
import {
  buildAppointmentDateMap,
  filterAppointmentsByDateVisibility,
  filterAppointmentsInWeek,
  getMonthGridDays,
  getWeekRange,
  getWeekDays,
} from '../utils/calendar'

describe('calendar utilities', () => {
  it('builds a month grid with correct start and cell count', () => {
    const days = getMonthGridDays(2026, 0, 1)
    expect(days).toHaveLength(35)
    expect(formatDateYYYYMMDD(days[0])).toBe('2025-12-29')
    expect(days[0].getDay()).toBe(1)
  })

  it('builds a week with seven days starting on Monday', () => {
    const anchor = new Date(2026, 0, 7)
    const weekDays = getWeekDays(anchor, 1)
    expect(weekDays).toHaveLength(7)
    expect(formatDateYYYYMMDD(weekDays[0])).toBe('2026-01-05')
    expect(formatDateYYYYMMDD(weekDays[6])).toBe('2026-01-11')
  })

  it('returns a week range with start and end dates', () => {
    const range = getWeekRange(new Date(2026, 0, 7), 1)
    expect(formatDateYYYYMMDD(range.start)).toBe('2026-01-05')
    expect(formatDateYYYYMMDD(range.end)).toBe('2026-01-11')
  })

  it('groups appointments by date and sorts by start time', () => {
    const appointments = [
      { id: 'a', date: '2026-01-10', startUtcMs: 200 },
      { id: 'b', date: '2026-01-10', startUtcMs: 100 },
      { id: 'c', date: '2026-01-11', startUtcMs: 300 },
    ]
    const map = buildAppointmentDateMap(appointments)
    const jan10 = map.get('2026-01-10')
    expect(jan10.map((item) => item.id)).toEqual(['b', 'a'])
    expect(map.get('2026-01-11')).toHaveLength(1)
  })

  it('filters past appointments by date when showPast is false', () => {
    const appointments = [
      { id: 'past', date: '2026-01-09' },
      { id: 'today', date: '2026-01-10' },
    ]
    const visible = filterAppointmentsByDateVisibility(
      appointments,
      '2026-01-10',
      false,
    )
    expect(visible.map((item) => item.id)).toEqual(['today'])
    const all = filterAppointmentsByDateVisibility(appointments, '2026-01-10', true)
    expect(all).toHaveLength(2)
  })

  it('filters week appointments and respects showPast', () => {
    const appointments = [
      { id: 'past', date: '2026-01-09', startUtcMs: 100 },
      { id: 'future', date: '2026-01-11', startUtcMs: 300 },
      { id: 'out', date: '2026-01-20', startUtcMs: 400 },
    ]
    const nowMs = 200
    const weekOnly = filterAppointmentsInWeek({
      appointments,
      weekStartStr: '2026-01-05',
      weekEndStr: '2026-01-11',
      showPast: false,
      nowMs,
    })
    expect(weekOnly.map((item) => item.id)).toEqual(['future'])
    const withPast = filterAppointmentsInWeek({
      appointments,
      weekStartStr: '2026-01-05',
      weekEndStr: '2026-01-11',
      showPast: true,
      nowMs,
    })
    expect(withPast.map((item) => item.id)).toEqual(['past', 'future'])
  })
})
