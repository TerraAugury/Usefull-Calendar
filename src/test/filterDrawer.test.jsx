import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarScreen from '../screens/CalendarScreen'
import { AppStateProvider } from '../state/AppState'
import { DEFAULT_FILTERS } from '../utils/constants'

const baseState = {
  categories: [{ id: 'cat-1', name: 'General', color: 'blue' }],
  appointments: [],
  preferences: { theme: 'system' },
  ui: {
    tab: 'calendar',
    filters: { ...DEFAULT_FILTERS, search: 'doctor' },
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

    await user.click(screen.getByLabelText(/open filters/i))
    const searchInput = screen.getByLabelText(/search/i)
    expect(searchInput).toHaveValue('doctor')

    await user.click(screen.getByRole('button', { name: /reset filters/i }))
    expect(searchInput).toHaveValue('')
  })
})
