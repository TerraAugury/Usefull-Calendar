import { validateAppointmentInput, validateCategoryInput } from '../utils/validation'

describe('validation', () => {
  it('rejects duplicate category names (case-insensitive)', () => {
    const existing = [{ id: '1', name: 'Work', color: 'blue' }]
    const errors = validateCategoryInput({ name: 'work', color: 'green' }, existing)
    expect(errors.name).toBeDefined()
  })

  it('rejects invalid category colors', () => {
    const errors = validateCategoryInput({ name: 'Personal', color: 'mint' }, [])
    expect(errors.color).toBeDefined()
  })

  it('requires appointment fields', () => {
    const errors = validateAppointmentInput(
      { title: '', date: '', startTime: '', categoryId: '' },
      [],
    )
    expect(errors.title).toBeDefined()
    expect(errors.date).toBeDefined()
    expect(errors.startTime).toBeDefined()
    expect(errors.categoryId).toBeDefined()
  })

  it('requires end time to be after start time', () => {
    const categories = [{ id: 'cat-1', name: 'Work', color: 'blue' }]
    const errors = validateAppointmentInput(
      {
        title: 'Checkup',
        date: '2026-01-01',
        startTime: '10:30',
        endTime: '09:30',
        categoryId: 'cat-1',
      },
      categories,
    )
    expect(errors.endTime).toBeDefined()
  })
})
