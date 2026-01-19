import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDefaultCategories } from '../data/sampleData'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'
import { renderWithState } from './renderUtils'

describe('category icon picker', () => {
  it('adds a category with a chosen emoji icon', async () => {
    const coffeeIcon = '\u2615\uFE0F'
    const user = userEvent.setup()
    const categories = getDefaultCategories()
    const addDraft = { ...EMPTY_DRAFT, categoryId: categories[0].id }
    const initialState = {
      categories,
      appointments: [],
      preferences: { theme: 'system', showPast: false, timeMode: 'timezone' },
      ui: {
        tab: 'categories',
        filters: { ...DEFAULT_FILTERS },
        addDraft,
        toast: null,
        lastAddedId: null,
      },
    }

    await renderWithState(initialState)

    await act(async () => {
      await user.type(screen.getByLabelText(/name/i), 'Cafe')
    })
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /choose icon/i }))
    })
    await screen.findByRole('dialog')
    await act(async () => {
      await user.click(screen.getByLabelText(`Select ${coffeeIcon}`))
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /add category/i }))
    })

    const cafeTitle = await screen.findByText('Cafe')
    const card = cafeTitle.closest('.appointment-card')
    expect(card).not.toBeNull()
    expect(within(card).getAllByText(coffeeIcon).length).toBeGreaterThan(0)
  })
})
