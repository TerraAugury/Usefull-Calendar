import { render, screen, waitFor } from '@testing-library/react'
import { AppShell } from '../App'
import { AppStateProvider } from '../state/AppState'

const FALLBACK_KEY = 'useful_calendar_fallback_v1'

export async function renderWithState(state) {
  try {
    globalThis.localStorage?.removeItem(FALLBACK_KEY)
  } catch {
    // Ignore localStorage errors in tests.
  }

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
