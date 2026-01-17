import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AddScreen from '../screens/AddScreen'
import { AppStateProvider } from '../state/AppState'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'

describe('Add appointment timezone mode', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('requires a timezone selection before saving', async () => {
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

    render(
      <AppStateProvider initialState={state}>
        <AddScreen />
      </AppStateProvider>,
    )

    await act(async () => {
      await user.type(screen.getByLabelText('Title'), 'Timezone meeting')
      await user.type(screen.getByLabelText('Date'), '2026-01-11')
      await user.type(screen.getByLabelText('Start time'), '10:00')
    })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /save appointment/i }))
    })
    expect(screen.getByText('Timezone is required.')).toBeInTheDocument()
  })
})
