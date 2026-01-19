import { applyFilters, groupByDate, splitAndSortAppointments } from '../utils/agenda'

describe('agenda logic', () => {
  const appointments = [
    {
      id: 'a1',
      title: 'Morning call',
      date: '2026-01-10',
      startTime: '09:00',
      endTime: '',
      categoryId: 'cat-b',
      location: 'Zoom',
      notes: '',
      status: 'planned',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
      timeZoneSource: 'manual',
      startUtcMs: Date.UTC(2026, 0, 10, 9, 0),
    },
    {
      id: 'a2',
      title: 'Doctor visit',
      date: '2026-01-11',
      startTime: '11:00',
      endTime: '',
      categoryId: 'cat-a',
      location: 'Clinic',
      notes: 'Bring forms',
      status: 'planned',
      createdAt: '2026-01-02T08:00:00.000Z',
      updatedAt: '2026-01-02T08:00:00.000Z',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
      timeZoneSource: 'manual',
      startUtcMs: Date.UTC(2026, 0, 11, 11, 0),
    },
    {
      id: 'a3',
      title: 'Lunch',
      date: '2026-01-10',
      startTime: '12:00',
      endTime: '',
      categoryId: 'cat-a',
      location: '',
      notes: '',
      status: 'planned',
      createdAt: '2026-01-03T08:00:00.000Z',
      updatedAt: '2026-01-03T08:00:00.000Z',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
      timeZoneSource: 'manual',
      startUtcMs: Date.UTC(2026, 0, 10, 12, 0),
    },
    {
      id: 'a4',
      title: 'Wrap-up',
      date: '2026-01-12',
      startTime: '08:00',
      endTime: '',
      categoryId: 'cat-b',
      location: '',
      notes: '',
      status: 'planned',
      createdAt: '2026-01-04T08:00:00.000Z',
      updatedAt: '2026-01-04T08:00:00.000Z',
      timeMode: 'timezone',
      timeZone: 'Europe/London',
      timeZoneSource: 'manual',
      startUtcMs: Date.UTC(2026, 0, 12, 8, 0),
    },
  ]

  it('filters by search and category', () => {
    const filtered = applyFilters(appointments, {
      search: 'doctor',
      categoryId: 'cat-a',
      dateFrom: '',
      dateTo: '',
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('a2')
  })

  it('filters by date range', () => {
    const filtered = applyFilters(appointments, {
      search: '',
      categoryId: 'all',
      dateFrom: '2026-01-11',
      dateTo: '2026-01-11',
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('a2')
  })

  it('splits and sorts upcoming and past using now', () => {
    const now = new Date(Date.UTC(2026, 0, 11, 10, 0))
    const { upcoming, past } = splitAndSortAppointments(appointments, now)
    expect(upcoming.map((item) => item.id)).toEqual(['a2', 'a4'])
    expect(past.map((item) => item.id)).toEqual(['a3', 'a1'])
  })

  it('starts with the next upcoming appointment', () => {
    const now = new Date(Date.UTC(2026, 0, 11, 10, 0))
    const { upcoming } = splitAndSortAppointments(appointments, now)
    expect(upcoming[0].id).toBe('a2')
  })

  it('groups by date', () => {
    const now = new Date(Date.UTC(2026, 0, 11, 10, 0))
    const { upcoming } = splitAndSortAppointments(appointments, now)
    const grouped = groupByDate(upcoming)
    expect(grouped).toHaveLength(2)
    expect(grouped[0].date).toBe('2026-01-11')
    expect(grouped[0].items).toHaveLength(1)
  })
})
