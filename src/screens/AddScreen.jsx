import { useEffect, useMemo, useState } from 'react'
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
import { DEFAULT_PAX_STATE } from '../utils/pax'
import { resolveTimeZoneState } from '../utils/timezone'

export default function AddScreen() {
  const { ui, categories, preferences, pax } = useAppState()
  const dispatch = useAppDispatch()
  const [errors, setErrors] = useState({})
  const [forceTimeZonePicker, setForceTimeZonePicker] = useState(false)
  const now = new Date()
  const timeMode = preferences.timeMode ?? 'timezone'
  const paxState = pax ?? DEFAULT_PAX_STATE
  const selectedPaxName = paxState.selectedPaxName
  const paxFlights = useMemo(() => {
    if (!selectedPaxName) return []
    return paxState.paxLocations?.[selectedPaxName]?.flights ?? []
  }, [paxState.paxLocations, selectedPaxName])
  const resolvedTimeZone = useMemo(
    () =>
      resolveTimeZoneState({
        timeMode,
        dateStr: ui.addDraft.date,
        paxFlights,
        currentTimeZone: ui.addDraft.timeZone,
        currentSource: ui.addDraft.timeZoneSource,
      }),
    [
      timeMode,
      ui.addDraft.date,
      ui.addDraft.timeZone,
      ui.addDraft.timeZoneSource,
      paxFlights,
    ],
  )
  const timeZone =
    timeMode === 'timezone' ? resolvedTimeZone.timeZone : ''
  const timeZoneSource =
    timeMode === 'timezone' ? resolvedTimeZone.source : ''
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
  const draftForValidation = {
    ...ui.addDraft,
    timeZone,
    timeZoneSource,
  }
  const startInPast = isAppointmentStartInPast(draftForValidation, now, timeMode)
  const missingTimeZone = timeMode === 'timezone' && !timeZone
  const submitBlocked = startInPast || dateBeforeMin || missingTimeZone
  const visibleErrors = { ...errors }
  if (startInPast && !visibleErrors.startTime) {
    visibleErrors.startTime = 'Appointments cannot be in the past.'
  }
  const dateWarning = dateBeforeMin
    ? 'Past appointments cannot be saved. Choose a future date/time.'
    : ''

  useEffect(() => {
    if (timeMode !== 'timezone') {
      if (ui.addDraft.timeZone || ui.addDraft.timeZoneSource) {
        dispatch({
          type: 'SET_ADD_DRAFT',
          values: { timeZone: '', timeZoneSource: '' },
        })
      }
      if (forceTimeZonePicker) {
        setForceTimeZonePicker(false)
      }
      return
    }
    if (
      resolvedTimeZone.timeZone &&
      (resolvedTimeZone.timeZone !== ui.addDraft.timeZone ||
        resolvedTimeZone.source !== ui.addDraft.timeZoneSource)
    ) {
      dispatch({
        type: 'SET_ADD_DRAFT',
        values: {
          timeZone: resolvedTimeZone.timeZone,
          timeZoneSource: resolvedTimeZone.source,
        },
      })
    }
    if (
      !resolvedTimeZone.timeZone &&
      (ui.addDraft.timeZone || ui.addDraft.timeZoneSource)
    ) {
      dispatch({
        type: 'SET_ADD_DRAFT',
        values: { timeZone: '', timeZoneSource: '' },
      })
    }
  }, [
    timeMode,
    resolvedTimeZone.timeZone,
    resolvedTimeZone.source,
    ui.addDraft.timeZone,
    ui.addDraft.timeZoneSource,
    dispatch,
    forceTimeZonePicker,
  ])

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
    const nextErrors = validateAppointmentInput(
      draftForValidation,
      categories,
      now,
      timeMode,
    )
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: ui.addDraft.date,
      startTime: ui.addDraft.startTime,
      endTime: ui.addDraft.endTime,
      timeMode,
      timeZone,
    })
    if (!Number.isFinite(startUtcMs)) {
      setErrors({ startTime: 'Appointments cannot be in the past.' })
      return
    }
    const payload = { ...ui.addDraft, timeMode, timeZone, timeZoneSource, startUtcMs }
    if (ui.addDraft.endTime) {
      payload.endUtcMs = endUtcMs
    }
    if (timeMode !== 'timezone') {
      delete payload.timeZone
      delete payload.timeZoneSource
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
        values={draftForValidation}
        errors={visibleErrors}
        categories={categories}
        onChange={(values) => {
          if (
            Object.prototype.hasOwnProperty.call(values, 'timeZone') &&
            values.timeZone
          ) {
            setForceTimeZonePicker(false)
          }
          dispatch({ type: 'SET_ADD_DRAFT', values })
        }}
        onSubmit={handleSubmit}
        submitLabel="Save appointment"
        submitDisabled={submitBlocked}
        showTimeZone={timeMode === 'timezone'}
        timeZones={TIMEZONE_OPTIONS}
        showTimeZonePicker={
          timeMode === 'timezone' && (forceTimeZonePicker || !timeZone)
        }
        timeZoneBadge={timeZoneSource === 'inferred' ? 'Inferred' : ''}
        onRequestTimeZoneChange={() => setForceTimeZonePicker(true)}
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
