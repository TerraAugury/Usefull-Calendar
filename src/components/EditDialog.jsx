import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { validateAppointmentInput } from '../utils/validation'
import AppointmentForm from './AppointmentForm'
import { IconClose } from './Icons'

export default function EditDialog({
  open,
  onOpenChange,
  appointment,
  categories,
  onSave,
  onCancel,
}) {
  const [values, setValues] = useState(null)
  const [errors, setErrors] = useState({})

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
      })
      setErrors({})
    }
  }, [appointment])

  if (!appointment || !values) return null

  const handleSubmit = () => {
    const nextErrors = validateAppointmentInput(values, categories)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSave(values)
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
          <AppointmentForm
            values={values}
            errors={errors}
            categories={categories}
            onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            onCancel={onCancel}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
