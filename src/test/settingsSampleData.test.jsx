import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDefaultCategories } from '../data/sampleData'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'
import { renderWithState } from './renderUtils'

describe('Settings sample data', () => {
  it('confirms and loads sample data', async () => {
    const user = userEvent.setup()
    const categories = getDefaultCategories()
    const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
    const state = {
      categories,
      appointments: [],
      preferences: { theme: 'system', showPast: false, timeMode: 'timezone' },
      ui: {
        tab: 'settings',
        filters: { ...DEFAULT_FILTERS },
        addDraft,
        toast: null,
        lastAddedId: null,
      },
    }

    await renderWithState(state)

    const openButton = screen.getByRole('button', { name: /load sample data/i })
    await act(async () => {
      await user.click(openButton)
    })
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /load sample data/i }))
    })

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(openButton).toBeDisabled())
  })
})
