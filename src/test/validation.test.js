import { validateAppointmentInput, validateCategoryInput } from '../utils/validation'

describe('validation', () => {
  it('rejects duplicate category names (case-insensitive)', () => {
    const existing = [{ id: '1', name: 'Work', color: 'blue', icon: '\u{1F4BC}' }]
    const errors = validateCategoryInput(
      { name: 'work', color: 'green', icon: '\u2B50' },
      existing,
    )
    expect(errors.name).toBeDefined()
  })

  it('rejects invalid category colors', () => {
    const errors = validateCategoryInput(
      { name: 'Personal', color: 'mint', icon: '\u{1F3F7}\uFE0F' },
      [],
    )
    expect(errors.color).toBeDefined()
  })

  it('requires category icon', () => {
    const errors = validateCategoryInput({ name: 'Personal', color: 'blue' }, [])
    expect(errors.icon).toBeDefined()
  })

  it('requires appointment fields', () => {
    const errors = validateAppointmentInput(
      { title: '', date: '', startTime: '', categoryId: '' },
      [],
      new Date(),
      'local',
    )
    expect(errors.title).toBeDefined()
    expect(errors.date).toBeDefined()
    expect(errors.startTime).toBeDefined()
    expect(errors.categoryId).toBeDefined()
  })

  it('requires end time to be after start time', () => {
    const categories = [{ id: 'cat-1', name: 'Work', color: 'blue', icon: '\u{1F4BC}' }]
    const errors = validateAppointmentInput(
      {
        title: 'Checkup',
        date: '2026-01-01',
        startTime: '10:30',
        endTime: '09:30',
        categoryId: 'cat-1',
        timeZone: '',
      },
      categories,
      new Date(),
      'local',
    )
    expect(errors.endTime).toBeDefined()
  })

  it('rejects appointments in the past', () => {
    const categories = [{ id: 'cat-1', name: 'Work', color: 'blue', icon: '\u{1F4BC}' }]
    const now = new Date(2026, 0, 10, 10, 0)
    const errors = validateAppointmentInput(
      {
        title: 'Checkup',
        date: '2026-01-10',
        startTime: '09:00',
        endTime: '',
        categoryId: 'cat-1',
        timeZone: '',
      },
      categories,
      now,
      'local',
    )
    expect(errors.startTime).toBeDefined()
  })

  it('requires timezone in timezone mode', () => {
    const categories = [{ id: 'cat-1', name: 'Work', color: 'blue', icon: '\u{1F4BC}' }]
    const errors = validateAppointmentInput(
      {
        title: 'Checkup',
        date: '2026-01-10',
        startTime: '11:00',
        endTime: '',
        categoryId: 'cat-1',
        timeZone: '',
      },
      categories,
      new Date(),
      'timezone',
    )
    expect(errors.timeZone).toBeDefined()
  })
})
