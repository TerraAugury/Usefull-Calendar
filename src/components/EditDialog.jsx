import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
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
import AppointmentForm from './AppointmentForm'
import { IconClose } from './Icons'
import { DEFAULT_PAX_STATE } from '../utils/pax'
import { resolveTimeZoneState } from '../utils/timezone'

export default function EditDialog({
  open,
  onOpenChange,
  appointment,
  categories,
  preferences,
  pax,
  onSave,
  onCancel,
}) {
  const initialValues = appointment
    ? {
        title: appointment.title ?? '',
        date: appointment.date ?? '',
        startTime: appointment.startTime ?? '',
        endTime: appointment.endTime ?? '',
        categoryId: appointment.categoryId ?? '',
        location: appointment.location ?? '',
        notes: appointment.notes ?? '',
        timeZone: appointment.timeZone ?? '',
        timeZoneSource:
          appointment.timeZoneSource ??
          (appointment.timeMode === 'timezone' && appointment.timeZone ? 'manual' : ''),
      }
    : null
  const [values, setValues] = useState(() => initialValues)
  const [errors, setErrors] = useState({})
  const [forceTimeZonePicker, setForceTimeZonePicker] = useState(false)
  const formId = 'edit-appointment-form'
  const safeValues =
    values ?? {
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      categoryId: '',
      location: '',
      notes: '',
      timeZone: '',
      timeZoneSource: '',
    }

  const handleChange = (patch) => {
    setValues((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      const startMinutes = timeStringToMinutes(next.startTime)
      const endMinutes = timeStringToMinutes(next.endTime)
      if (
        startMinutes !== null &&
        endMinutes !== null &&
        endMinutes < startMinutes
      ) {
        next.endTime = ''
      }
      return next
    })
  }

  const now = new Date()
  const timeMode = appointment?.timeMode ?? preferences?.timeMode ?? 'timezone'
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
        dateStr: safeValues.date,
        paxFlights,
        currentTimeZone: safeValues.timeZone,
        currentSource: safeValues.timeZoneSource,
      }),
    [
      timeMode,
      safeValues.date,
      safeValues.timeZone,
      safeValues.timeZoneSource,
      paxFlights,
    ],
  )
  const timeZone =
    timeMode === 'timezone' ? resolvedTimeZone.timeZone : ''
  const timeZoneSource =
    timeMode === 'timezone' ? resolvedTimeZone.source : ''
  const today = getTodayYYYYMMDD({ mode: timeMode, timeZone, now })
  const dateMin = today
  const isToday = today && safeValues.date === today
  const timeDisabled = timeMode === 'timezone' && !timeZone
  const startTimeMin =
    !timeDisabled && isToday
      ? getNowTimeHHMM({ mode: timeMode, timeZone, now, stepMinutes: 1 })
      : ''
  const endTimeMin = safeValues.startTime || ''
  const dateBeforeMin =
    safeValues.date && dateMin && safeValues.date < dateMin
  const draftForValidation = {
    ...safeValues,
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
      date: safeValues.date,
      startTime: safeValues.startTime,
      endTime: safeValues.endTime,
      timeMode,
      timeZone,
    })
    if (!Number.isFinite(startUtcMs)) {
      setErrors({ startTime: 'Appointments cannot be in the past.' })
      return
    }
    const payload = {
      ...safeValues,
      timeMode,
      timeZone,
      timeZoneSource,
      startUtcMs,
    }
    if (safeValues.endTime) {
      payload.endUtcMs = endUtcMs
    }
    if (timeMode !== 'timezone') {
      delete payload.timeZone
      delete payload.timeZoneSource
    }
    onSave(payload)
  }

  if (!appointment || !values) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">Edit appointment</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close edit form">
                <IconClose className="tab-icon" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Update appointment details and save your changes.
          </Dialog.Description>
          <div className="dialog-body">
            <AppointmentForm
              values={draftForValidation}
              errors={visibleErrors}
              categories={categories}
              onChange={(patch) => {
                if (
                  Object.prototype.hasOwnProperty.call(patch, 'timeZone') &&
                  patch.timeZone
                ) {
                  setForceTimeZonePicker(false)
                }
                handleChange(patch)
              }}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
              showActions={false}
              formId={formId}
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
          </div>
          <div className="dialog-footer button-row">
            <button
              className="btn btn-primary"
              type="submit"
              form={formId}
              disabled={submitBlocked}
            >
              Save changes
            </button>
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
