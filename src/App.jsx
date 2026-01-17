import { useEffect } from 'react'
import BottomTabs from './components/BottomTabs'
import Toast from './components/Toast'
import AddScreen from './screens/AddScreen'
import CalendarScreen from './screens/CalendarScreen'
import CategoriesScreen from './screens/CategoriesScreen'
import SettingsScreen from './screens/SettingsScreen'
import { AppStateProvider, useAppState } from './state/AppState'

function AppShell() {
  const { ui, preferences } = useAppState()

  useEffect(() => {
    const root = document.documentElement
    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', preferences.theme)
    }
  }, [preferences.theme])

  return (
    <div className="app">
      <main className="app-main">
        {ui.tab === 'calendar' ? <CalendarScreen /> : null}
        {ui.tab === 'add' ? <AddScreen /> : null}
        {ui.tab === 'categories' ? <CategoriesScreen /> : null}
        {ui.tab === 'settings' ? <SettingsScreen /> : null}
      </main>
      <BottomTabs />
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
