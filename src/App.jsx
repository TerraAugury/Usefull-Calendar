import { useEffect } from 'react'
import BottomTabs from './components/BottomTabs'
import Toast from './components/Toast'
import AddScreen from './screens/AddScreen'
import CalendarScreen from './screens/CalendarScreen'
import CategoriesScreen from './screens/CategoriesScreen'
import SettingsScreen from './screens/SettingsScreen'
import { AppStateProvider } from './state/AppState'
import { useAppState } from './state/hooks'

export function AppShell() {
  const { ui, preferences, isHydrated } = useAppState()

  useEffect(() => {
    const root = document.documentElement
    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', preferences.theme)
    }
  }, [preferences.theme])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (!isHydrated) {
      window.__APP_READY__ = false
      return undefined
    }
    let frame1 = 0
    let frame2 = 0
    frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        window.__APP_READY__ = true
      })
    })
    return () => {
      window.cancelAnimationFrame(frame1)
      window.cancelAnimationFrame(frame2)
    }
  }, [isHydrated])

  return (
    <div className="app">
      <main
        className="app-main"
        data-hydrated={isHydrated ? 'true' : 'false'}
        aria-busy={!isHydrated}
      >
        {!isHydrated ? (
          <section className="screen app-loading" role="status" aria-live="polite">
            <div className="empty-state">
              <h1 className="screen-title">Loading appointments...</h1>
              <p className="helper-text">Syncing saved data.</p>
            </div>
          </section>
        ) : (
          <>
            {ui.tab === 'calendar' ? <CalendarScreen /> : null}
            {ui.tab === 'add' ? <AddScreen /> : null}
            {ui.tab === 'categories' ? <CategoriesScreen /> : null}
            {ui.tab === 'settings' ? <SettingsScreen /> : null}
          </>
        )}
      </main>
      <BottomTabs disabled={!isHydrated} />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  )
}
