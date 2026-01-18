import { useEffect, useReducer } from 'react'
import { reducer, createInitialState } from './reducer'
import { AppDispatchContext, AppStateContext } from './context'
import { DEFAULT_PAX_STATE } from '../utils/pax'
import { saveStoredData } from '../storage/storage'

export function AppStateProvider({ children, initialState }) {
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
    saveStoredData({
      categories: state.categories,
      appointments: state.appointments,
      preferences: state.preferences,
      pax: state.pax,
    })
  }, [state.categories, state.appointments, state.preferences, state.pax])

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}
