import { useEffect, useState } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import { useAppDispatch, useAppState } from '../state/hooks'
import { TIMEZONE_OPTIONS } from '../utils/constants'
import {
  buildUtcFields,
  getNowTimeHHMM,
  getTodayYYYYMMDD,
  timeStringToMinutes,
} from '../utils/dates'
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
  const timeZone = ui.addDraft.timeZone
  const today = getTodayYYYYMMDD({ mode: timeMode, timeZone, now })
  const dateMin = today
  const isToday = today && ui.addDraft.date === today
  const timeDisabled = timeMode === 'timezone' && !timeZone
  const startTimeMin =
    !timeDisabled && isToday
      ? getNowTimeHHMM({ mode: timeMode, timeZone, now, stepMinutes: 1 })
      : ''
  const endTimeMin = ui.addDraft.startTime || ''
  const dateBeforeMin = ui.addDraft.date && dateMin && ui.addDraft.date < dateMin
  const startInPast = isAppointmentStartInPast(ui.addDraft, now, timeMode)
  const submitBlocked = startInPast || dateBeforeMin
  const visibleErrors = { ...errors }
  if (startInPast && !visibleErrors.startTime) {
    visibleErrors.startTime = 'Appointments cannot be in the past.'
  }
  const dateWarning = dateBeforeMin
    ? 'Past appointments cannot be saved. Choose a future date/time.'
    : ''

  useEffect(() => {
    const startMinutes = timeStringToMinutes(ui.addDraft.startTime)
    const endMinutes = timeStringToMinutes(ui.addDraft.endTime)
    if (
      startMinutes !== null &&
      endMinutes !== null &&
      endMinutes < startMinutes
    ) {
      dispatch({ type: 'SET_ADD_DRAFT', values: { endTime: '' } })
    }
  }, [ui.addDraft.startTime, ui.addDraft.endTime, dispatch])

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
        submitDisabled={submitBlocked}
        showTimeZone={timeMode === 'timezone'}
        timeZones={TIMEZONE_OPTIONS}
        dateMin={dateMin}
        startTimeMin={startTimeMin}
        endTimeMin={endTimeMin}
        timeDisabled={timeDisabled}
        timeDisabledMessage={timeDisabled ? 'Select timezone first.' : ''}
        dateWarning={dateWarning}
      />
    </section>
  )
}
