import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'
import { renderWithState } from './renderUtils'

describe('Calendar pax country labels', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 9, 0, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders country label with flag for a selected pax', async () => {
    const categories = [
      { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
    ]
    const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
    const pax = {
      selectedPaxName: 'Alex',
      paxNames: ['Alex'],
      paxLocations: {
        Alex: {
          flights: [
            {
              paxName: 'Alex',
              flightDate: '2026-01-10',
              flightNumber: 'AF100',
              fromIata: 'CDG',
              toIata: 'LHR',
              depScheduled: '2026-01-10T08:00',
              arrScheduled: '2026-01-10T10:00',
            },
          ],
        },
      },
    }
    const state = {
      categories,
      appointments: [],
      preferences: {
        theme: 'system',
        showPast: true,
        timeMode: 'timezone',
        calendarViewMode: 'calendar',
        calendarGridMode: 'month',
      },
      pax,
      ui: {
        tab: 'calendar',
        filters: { ...DEFAULT_FILTERS },
        addDraft,
        toast: null,
        lastAddedId: null,
      },
    }

    await renderWithState(state)

    expect(screen.getAllByText('France').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('img', { name: 'Flag of France' }).length).toBeGreaterThan(0)
  })
})
