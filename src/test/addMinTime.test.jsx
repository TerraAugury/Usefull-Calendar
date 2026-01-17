import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AddScreen from '../screens/AddScreen'
import { AppStateProvider } from '../state/AppState'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'

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
    const categories = [
      { id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' },
    ]
    const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
    const state = {
      categories,
      appointments: [],
      preferences: { theme: 'system', showPast: false, timeMode: 'local' },
      ui: {
        tab: 'add',
        filters: { ...DEFAULT_FILTERS },
        addDraft,
        toast: null,
        lastAddedId: null,
      },
    }

    render(
      <AppStateProvider initialState={state}>
        <AddScreen />
      </AppStateProvider>,
    )

    const dateInput = screen.getByLabelText('Date')
    expect(dateInput).toHaveAttribute('min', '2026-01-10')

    await act(async () => {
      await user.type(dateInput, '2026-01-10')
    })

    const timeInput = screen.getByLabelText('Start time')
    expect(timeInput).toHaveAttribute('min', '10:00')
  })
})
