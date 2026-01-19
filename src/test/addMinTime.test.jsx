import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DEFAULT_FILTERS, DEFAULT_TIME_ZONE, EMPTY_DRAFT } from '../utils/constants'
import { getNowTimeHHMM, getTodayYYYYMMDD } from '../utils/dates'
import { renderWithState } from './renderUtils'

describe('Add appointment date/time mins', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets date min and time min for today', async () => {
    const user = userEvent.setup()
    const timeZone = DEFAULT_TIME_ZONE
    const now = new Date(2026, 0, 10, 10, 0, 0, 0)
    const categories = [
      { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
    ]
    const addDraft = {
      ...EMPTY_DRAFT,
      categoryId: categories[0].id,
      timeZone,
      timeZoneSource: 'manual',
    }
    const state = {
      categories,
      appointments: [],
      preferences: { theme: 'system', showPast: false, timeMode: 'timezone' },
      ui: {
        tab: 'add',
        filters: { ...DEFAULT_FILTERS },
        addDraft,
        toast: null,
        lastAddedId: null,
      },
    }

    await renderWithState(state)

    const dateInput = screen.getByLabelText('Date')
    const expectedDate = getTodayYYYYMMDD({ mode: 'timezone', timeZone, now })
    expect(dateInput).toHaveAttribute('min', expectedDate)

    await act(async () => {
      await user.type(dateInput, expectedDate)
    })

    const timeInput = screen.getByLabelText('Start time')
    const expectedTime = getNowTimeHHMM({
      mode: 'timezone',
      timeZone,
      now,
      stepMinutes: 1,
    })
    expect(timeInput).toHaveAttribute('min', expectedTime)
  })
})
