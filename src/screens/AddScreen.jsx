import { useState } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import { useAppDispatch, useAppState } from '../state/AppState'
import { EUROPE_TIMEZONES } from '../utils/constants'
import { buildUtcFields } from '../utils/dates'
import {
  isAppointmentStartInPast,
  validateAppointmentInput,
} from '../utils/validation'

export default function AddScreen() {
  const { ui, categories, preferences } = useAppState()
  const dispatch = useAppDispatch()
  const [errors, setErrors] = useState({})
  const now = new Date()
  const timeMode = preferences.timeMode ?? 'local'
  const startInPast = isAppointmentStartInPast(ui.addDraft, now, timeMode)
  const visibleErrors = { ...errors }
  if (startInPast && !visibleErrors.startTime) {
    visibleErrors.startTime = 'Appointments cannot be in the past.'
  }

  const handleSubmit = () => {
    const nextErrors = validateAppointmentInput(ui.addDraft, categories, now, timeMode)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: ui.addDraft.date,
      startTime: ui.addDraft.startTime,
      endTime: ui.addDraft.endTime,
      timeMode,
      timeZone: ui.addDraft.timeZone,
    })
    if (!Number.isFinite(startUtcMs)) {
      setErrors({ startTime: 'Appointments cannot be in the past.' })
      return
    }
    const payload = { ...ui.addDraft, timeMode, startUtcMs }
    if (ui.addDraft.endTime) {
      payload.endUtcMs = endUtcMs
    }
    if (timeMode !== 'timezone') {
      delete payload.timeZone
    }
    dispatch({ type: 'ADD_APPOINTMENT', values: payload })
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
        errors={visibleErrors}
        categories={categories}
        onChange={(values) => dispatch({ type: 'SET_ADD_DRAFT', values })}
        onSubmit={handleSubmit}
        submitLabel="Save appointment"
        submitDisabled={startInPast}
        showTimeZone={timeMode === 'timezone'}
        timeZones={EUROPE_TIMEZONES}
      />
    </section>
  )
}
