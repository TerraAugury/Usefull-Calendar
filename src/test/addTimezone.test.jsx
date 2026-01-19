import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'
import { renderWithState } from './renderUtils'

describe('Add appointment timezone mode', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('disables time input until a timezone is selected', async () => {
    const user = userEvent.setup()
    const categories = [
      { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
    ]
    const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
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

    const startTimeInput = screen.getByLabelText('Start time')
    const timeZoneSelect = screen.queryByLabelText('Timezone')
    if (timeZoneSelect) {
      expect(startTimeInput).toBeDisabled()
      expect(screen.getByText('Select timezone first.')).toBeInTheDocument()
    } else {
      expect(startTimeInput).not.toBeDisabled()
    }

    await act(async () => {
      if (!timeZoneSelect) {
        await user.click(screen.getByRole('button', { name: 'Change' }))
      }
      await user.selectOptions(screen.getByLabelText('Timezone'), 'Europe/Paris')
    })
    expect(startTimeInput).not.toBeDisabled()
  })
})
