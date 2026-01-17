import { render } from '@testing-library/react'
import { vi } from 'vitest'
import CalendarScreen from '../screens/CalendarScreen'
import { AppStateProvider } from '../state/AppState'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'

const categories = [
  { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
]

const appointments = [
  {
    id: 'a1',
    title: 'Earlier appointment',
    date: '2026-01-10',
    startTime: '09:00',
    endTime: '',
    categoryId: 'cat-1',
    location: '',
    notes: '',
    status: 'planned',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    timeMode: 'timezone',
    timeZone: 'Europe/London',
    startUtcMs: Date.UTC(2026, 0, 10, 9, 0),
  },
  {
    id: 'a2',
    title: 'Next appointment',
    date: '2026-01-11',
    startTime: '11:00',
    endTime: '',
    categoryId: 'cat-1',
    location: '',
    notes: '',
    status: 'planned',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    timeMode: 'timezone',
    timeZone: 'Europe/London',
    startUtcMs: Date.UTC(2026, 0, 11, 11, 0),
  },
  {
    id: 'a3',
    title: 'Later appointment',
    date: '2026-01-12',
    startTime: '08:00',
    endTime: '',
    categoryId: 'cat-1',
    location: '',
    notes: '',
    status: 'planned',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    timeMode: 'timezone',
    timeZone: 'Europe/London',
    startUtcMs: Date.UTC(2026, 0, 12, 8, 0),
  },
]

function buildState(showPast) {
  const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
  return {
    categories,
    appointments,
    preferences: { theme: 'system', showPast, timeMode: 'timezone' },
    ui: {
      tab: 'calendar',
      filters: { ...DEFAULT_FILTERS },
      addDraft,
      toast: null,
      lastAddedId: null,
    },
  }
}

describe('Calendar sections', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(Date.UTC(2026, 0, 11, 10, 0)))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows upcoming before past when enabled', () => {
    const { container } = render(
      <AppStateProvider initialState={buildState(true)}>
        <CalendarScreen />
      </AppStateProvider>,
    )

    const labels = container.querySelectorAll('.section-label')
    expect(labels[0]?.textContent).toBe('Upcoming')
    expect(labels[1]?.textContent).toBe('Past')
  })

  it('starts with the next upcoming appointment by default', () => {
    const { container } = render(
      <AppStateProvider initialState={buildState(false)}>
        <CalendarScreen />
      </AppStateProvider>,
    )

    const cards = container.querySelectorAll('.appointment-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].dataset.appointmentId).toBe('a2')
  })
})
