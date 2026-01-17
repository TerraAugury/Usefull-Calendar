import { applyFilters, groupByDate, sortAppointments } from '../utils/agenda'

describe('agenda logic', () => {
  const categories = [
    { id: 'cat-a', name: 'Home', color: 'green' },
    { id: 'cat-b', name: 'Work', color: 'blue' },
  ]

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
    },
  ]

  it('filters by search and category', () => {
    const filtered = applyFilters(appointments, {
      search: 'doctor',
      categoryId: 'cat-a',
      dateFrom: '',
      dateTo: '',
      sort: 'date-asc',
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('a2')
  })

  it('sorts by date descending', () => {
    const sorted = sortAppointments(appointments, categories, 'date-desc')
    expect(sorted[0].date).toBe('2026-01-11')
  })

  it('groups by date', () => {
    const sorted = sortAppointments(appointments, categories, 'date-asc')
    const grouped = groupByDate(sorted)
    expect(grouped).toHaveLength(2)
    expect(grouped[0].date).toBe('2026-01-10')
    expect(grouped[0].items).toHaveLength(2)
  })
})
