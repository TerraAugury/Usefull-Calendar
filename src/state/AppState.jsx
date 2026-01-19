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
    loadStoredData()
      .then((stored) => {
        if (!active || !stored) return
        dispatch({ type: 'HYDRATE_STATE', values: stored })
      })
      .finally(() => {
        if (active) setIsHydrated(true)
      })
    return () => {
      active = false
    }
  }, [dispatch])

  useEffect(() => {
    if (!isHydrated) return
    saveStoredData({
      categories: state.categories,
      appointments: state.appointments,
      preferences: state.preferences,
      pax: state.pax,
    }).catch(() => {})
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
