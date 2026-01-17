import { useEffect } from 'react'
import { useAppDispatch, useAppState } from '../state/AppState'

export default function Toast() {
  const { ui } = useAppState()
  const dispatch = useAppDispatch()
  const toast = ui.toast

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_TOAST' })
    }, 2200)
    return () => clearTimeout(timer)
  }, [toast?.id, dispatch])

  if (!toast) return null

  return (
    <div className="toast" role="status">
      {toast.message}
    </div>
  )
}
