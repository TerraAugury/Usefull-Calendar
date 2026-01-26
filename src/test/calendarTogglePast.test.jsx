import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DEFAULT_FILTERS, DEFAULT_TIME_ZONE, EMPTY_DRAFT } from '../utils/constants'
import { buildUtcFields } from '../utils/dates'
import { renderWithState } from './renderUtils'

describe('Calendar past toggle', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals the past section when toggled on', async () => {
    const user = userEvent.setup()
    const categories = [
      { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
    ]
    const timeZone = DEFAULT_TIME_ZONE
    const pastTime = buildUtcFields({
      date: '2026-01-09',
      startTime: '09:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const futureTime = buildUtcFields({
      date: '2026-01-10',
      startTime: '11:00',
      endTime: '',
      timeMode: 'timezone',
      timeZone,
    }).startUtcMs
    const appointments = [
      {
        id: 'apt-1',
        title: 'Past item',
        date: '2026-01-09',
        startTime: '09:00',
        endTime: '',
        categoryId: 'cat-1',
        location: '',
        notes: '',
        status: 'done',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
        timeMode: 'timezone',
        timeZone,
        timeZoneSource: 'manual',
        startUtcMs: pastTime,
      },
      {
        id: 'apt-2',
        title: 'Upcoming item',
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
        startUtcMs: futureTime,
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
      await user.click(screen.getByLabelText(/More options/i))
    })
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Past' }))
    })

    await waitFor(() => expect(screen.getByText('Past item')).toBeInTheDocument())
  })
})
