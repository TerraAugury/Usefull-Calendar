import { useState } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import { useAppDispatch, useAppState } from '../state/AppState'
import { validateAppointmentInput } from '../utils/validation'

export default function AddScreen() {
  const { ui, categories } = useAppState()
  const dispatch = useAppDispatch()
  const [errors, setErrors] = useState({})

  const handleSubmit = () => {
    const nextErrors = validateAppointmentInput(ui.addDraft, categories)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    dispatch({ type: 'ADD_APPOINTMENT', values: ui.addDraft })
    dispatch({ type: 'RESET_ADD_DRAFT' })
    dispatch({ type: 'SET_TAB', tab: 'calendar' })
    setErrors({})
  }

  return (
    <section className="screen">
      <header className="screen-header">
        <h1 className="screen-title">Add appointment</h1>
      </header>
      <AppointmentForm
        values={ui.addDraft}
        errors={errors}
        categories={categories}
        onChange={(values) => dispatch({ type: 'SET_ADD_DRAFT', values })}
        onSubmit={handleSubmit}
        submitLabel="Save appointment"
      />
    </section>
  )
}
