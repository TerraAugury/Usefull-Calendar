import { loadStoredData } from '../storage/storage'
import { resetStorage } from './testUtils'

describe('storage normalization', () => {
  beforeEach(() => {
    resetStorage()
  })

  it('adds default icon when missing and saves back', () => {
    localStorage.setItem(
      'app_categories',
      JSON.stringify([{ id: 'cat-1', name: 'Doctors', color: 'red' }]),
    )
    localStorage.setItem('app_appointments', JSON.stringify([]))
    localStorage.setItem('app_preferences', JSON.stringify({ theme: 'system' }))

    const data = loadStoredData()
    expect(data.categories[0].icon).toBe('\u{1F3E5}')
    expect(data.preferences.showPast).toBe(false)
    expect(data.preferences.timeMode).toBe('local')
    expect(data.preferences.calendarViewMode).toBe('agenda')
    expect(data.preferences.calendarGridMode).toBe('month')
    expect(data.pax.selectedPaxName).toBe(null)

    const stored = JSON.parse(localStorage.getItem('app_categories'))
    expect(stored[0].icon).toBe('\u{1F3E5}')
  })
})
