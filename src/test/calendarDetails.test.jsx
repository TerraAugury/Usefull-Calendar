import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DEFAULT_FILTERS, DEFAULT_TIME_ZONE, EMPTY_DRAFT } from '../utils/constants'
import { buildUtcFields } from '../utils/dates'
import { renderWithState } from './renderUtils'

describe('Calendar details dialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens the details dialog when a card is clicked', async () => {
    const user = userEvent.setup()
    const categories = [
      { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
    ]
    const timeZone = DEFAULT_TIME_ZONE
    const { startUtcMs } = buildUtcFields({
      date: '2026-01-10',
      startTime: '11:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    })
    const appointments = [
      {
        id: 'apt-1',
        title: 'Team sync',
        date: '2026-01-10',
        startTime: '11:00',
        endTime: '',
        categoryId: 'cat-1',
        location: '',
        notes: '',
        status: 'planned',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
        timeMode: 'timezone',
        timeZone,
        timeZoneSource: 'manual',
        startUtcMs,
      },
    ]
    const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
    const state = {
      categories,
      appointments,
      preferences: { theme: 'system', showPast: false, timeMode: 'timezone' },
      ui: {
        tab: 'calendar',
        filters: { ...DEFAULT_FILTERS },
        addDraft,
        toast: null,
        lastAddedId: null,
      },
    }

    await renderWithState(state)

    await act(async () => {
      await user.click(screen.getByText('Team sync').closest('button'))
    })
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: 'Team sync' })).toBeInTheDocument()
  })
})
