import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getDefaultCategories } from '../data/sampleData'
import { DEFAULT_FILTERS, EMPTY_DRAFT } from '../utils/constants'
import { renderWithState } from './renderUtils'

describe('Settings import JSON', () => {
  it('enables import after a JSON file is selected', async () => {
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

    const importButton = screen.getByRole('button', { name: 'Import JSON' })
    expect(importButton).toBeDisabled()

    const importInput = screen.getByLabelText('Import JSON')
    const file = new File(['{}'], 'import.json', { type: 'application/json' })
    await act(async () => {
      await user.upload(importInput, file)
    })

    expect(importButton).toBeEnabled()
  })
})
