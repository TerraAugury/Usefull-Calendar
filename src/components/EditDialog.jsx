import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { EUROPE_TIMEZONES } from '../utils/constants'
import { buildUtcFields } from '../utils/dates'
import {
  isAppointmentStartInPast,
  validateAppointmentInput,
} from '../utils/validation'
import AppointmentForm from './AppointmentForm'
import { IconClose } from './Icons'

export default function EditDialog({
  open,
  onOpenChange,
  appointment,
  categories,
  preferences,
  onSave,
  onCancel,
}) {
  const [values, setValues] = useState(null)
  const [errors, setErrors] = useState({})
  const formId = 'edit-appointment-form'

  useEffect(() => {
    if (appointment) {
      setValues({
        title: appointment.title ?? '',
        date: appointment.date ?? '',
        startTime: appointment.startTime ?? '',
        endTime: appointment.endTime ?? '',
        categoryId: appointment.categoryId ?? '',
        location: appointment.location ?? '',
        notes: appointment.notes ?? '',
        timeZone: appointment.timeZone ?? '',
      })
      setErrors({})
    }
  }, [appointment])

  if (!appointment || !values) return null
  const now = new Date()
  const timeMode = appointment.timeMode ?? preferences?.timeMode ?? 'local'
  const startInPast = isAppointmentStartInPast(values, now, timeMode)
  const visibleErrors = { ...errors }
  if (startInPast && !visibleErrors.startTime) {
    visibleErrors.startTime = 'Appointments cannot be in the past.'
  }

  const handleSubmit = () => {
    const nextErrors = validateAppointmentInput(values, categories, now, timeMode)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      timeMode,
      timeZone: values.timeZone,
    })
    if (!Number.isFinite(startUtcMs)) {
      setErrors({ startTime: 'Appointments cannot be in the past.' })
      return
    }
    const payload = { ...values, timeMode, startUtcMs }
    if (values.endTime) {
      payload.endUtcMs = endUtcMs
    }
    if (timeMode !== 'timezone') {
      delete payload.timeZone
    }
    onSave(payload)
  }

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
              values={values}
              errors={visibleErrors}
              categories={categories}
              onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
              showActions={false}
              formId={formId}
              submitDisabled={startInPast}
              showTimeZone={timeMode === 'timezone'}
              timeZones={EUROPE_TIMEZONES}
            />
          </div>
          <div className="dialog-footer button-row">
            <button
              className="btn btn-primary"
              type="submit"
              form={formId}
              disabled={startInPast}
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
