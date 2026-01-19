import { render, screen, waitFor } from '@testing-library/react'
import { AppShell } from '../App'
import { AppStateProvider } from '../state/AppState'

export async function renderWithState(state) {
  const utils = render(
    <AppStateProvider initialState={state}>
      <AppShell />
    </AppStateProvider>,
  )

  await waitFor(() => {
    expect(screen.getByRole('main')).toHaveAttribute('data-hydrated', 'true')
  })

  return utils
}
