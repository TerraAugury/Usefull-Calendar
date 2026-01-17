import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarScreen from '../screens/CalendarScreen'
import { AppStateProvider } from '../state/AppState'
import { DEFAULT_FILTERS } from '../utils/constants'

const baseState = {
  categories: [{ id: 'cat-1', name: 'General', color: 'blue', icon: '\u{1F5D3}\uFE0F' }],
  appointments: [],
  preferences: { theme: 'system', showPast: false, timeMode: 'local' },
  ui: {
    tab: 'calendar',
    filters: { ...DEFAULT_FILTERS },
    addDraft: {
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      categoryId: 'cat-1',
      location: '',
      notes: '',
    },
    toast: null,
    lastAddedId: null,
  },
}

describe('Filter drawer', () => {
  it('resets filters from the drawer', async () => {
    const user = userEvent.setup()
    render(
      <AppStateProvider initialState={baseState}>
        <CalendarScreen />
      </AppStateProvider>,
    )

    const trigger = screen.getByLabelText(/open filters/i)
    expect(trigger.querySelector('.badge-dot')).toBeNull()

    await act(async () => {
      await user.click(trigger)
    })
    const searchInput = await screen.findByLabelText(/search/i)
    await act(async () => {
      await user.type(searchInput, 'doctor')
    })
    await waitFor(() => {
      expect(trigger.querySelector('.badge-dot')).not.toBeNull()
    })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /reset filters/i }))
    })
    await waitFor(() => expect(searchInput).toHaveValue(''))
    await waitFor(() => expect(trigger.querySelector('.badge-dot')).toBeNull())
    await act(async () => {
      await user.keyboard('{Escape}')
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
