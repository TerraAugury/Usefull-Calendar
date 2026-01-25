import { useEffect, useMemo, useReducer, useState } from 'react'
import { reducer, createInitialState } from './reducer'
import { AppDispatchContext, AppStateContext } from './context'
import { DEFAULT_PAX_STATE } from '../utils/pax'
import { loadStoredData, saveStoredData } from '../storage/storage'

export function AppStateProvider({ children, initialState }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    () => {
      const base = initialState ?? createInitialState()
      if (!base.pax) {
        return { ...base, pax: { ...DEFAULT_PAX_STATE, paxLocations: {} } }
      }
      return base
    },
  )

  useEffect(() => {
    let active = true
    let delayTimer
    const delayMs =
      typeof window !== 'undefined' &&
      Number.isFinite(window.__APP_HYDRATION_DELAY_MS__)
        ? window.__APP_HYDRATION_DELAY_MS__
        : 0
    // Allow tests to simulate slow hydration.
    const waitForDelay =
      delayMs > 0
        ? new Promise((resolve) => {
            delayTimer = setTimeout(resolve, delayMs)
          })
        : Promise.resolve()
    waitForDelay
      .then(() => loadStoredData())
      .then((stored) => {
        if (!active || !stored) return
        dispatch({ type: 'HYDRATE_STATE', values: stored })
      })
      .finally(() => {
        if (active) setIsHydrated(true)
      })
    return () => {
      active = false
      if (delayTimer) {
        clearTimeout(delayTimer)
      }
    }
  }, [dispatch])

  useEffect(() => {
    if (!isHydrated) return
    saveStoredData({
      categories: state.categories,
      appointments: state.appointments,
      preferences: state.preferences,
      pax: state.pax,
    }).catch((error) => {
      if (import.meta.env.DEV) {
        console.error('Failed to persist app data.', error)
      }
    })
  }, [isHydrated, state.categories, state.appointments, state.preferences, state.pax])

  const contextValue = useMemo(
    () => ({ ...state, isHydrated }),
    [state, isHydrated],
  )

  return (
    <AppStateContext.Provider value={contextValue}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}
