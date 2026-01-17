import { useId, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { getDefaultCategoryIcon } from '../data/sampleData'
import { STATUS_OPTIONS } from '../utils/constants'
import { formatDateLabel, formatDateTime, formatTimeRange } from '../utils/dates'
import { IconClose } from './Icons'
import ConfirmDialog from './ConfirmDialog'

const statusLabels = {
  planned: 'Planned',
  done: 'Done',
  cancelled: 'Cancelled',
}

const DEFAULT_ICON = getDefaultCategoryIcon()

export default function DetailsDialog({
  open,
  onOpenChange,
  appointment,
  category,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const statusId = useId()

  if (!appointment) return null
  const timeLabel = formatTimeRange(appointment.startTime, appointment.endTime)
  const zoneLabel =
    appointment.timeMode === 'timezone' && appointment.timeZone
      ? ` (${appointment.timeZone})`
      : ''

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="sheet-content">
            <div className="dialog-header">
              <Dialog.Title className="dialog-title">{appointment.title}</Dialog.Title>
              <Dialog.Close asChild>
                <button className="icon-button" type="button" aria-label="Close details">
                  <IconClose className="tab-icon" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Appointment details and actions.
            </Dialog.Description>

            <div className="dialog-body">
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span>{formatDateLabel(appointment.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time</span>
                  <span>
                    {timeLabel}
                    {zoneLabel}
                  </span>
                </div>
                {appointment.timeMode === 'timezone' && appointment.timeZone ? (
                  <div className="detail-row">
                    <span className="detail-label">Timezone</span>
                    <span>{appointment.timeZone}</span>
                  </div>
                ) : null}
                <div className="detail-row">
                  <span className="detail-label">Category</span>
                  <span className="emoji-inline">
                    <span>{category?.icon ?? DEFAULT_ICON}</span>
                    <span>{category?.name ?? 'Unassigned'}</span>
                  </span>
                </div>
                {appointment.location ? (
                  <div className="detail-row">
                    <span className="detail-label">Location</span>
                    <span>{appointment.location}</span>
                  </div>
                ) : null}
                {appointment.notes ? (
                  <div className="detail-row">
                    <span className="detail-label">Notes</span>
                    <span>{appointment.notes}</span>
                  </div>
                ) : null}
                <div className="detail-row">
                  <label className="detail-label" htmlFor={statusId}>
                    Status
                  </label>
                  <select
                    id={statusId}
                    value={appointment.status}
                    onChange={(event) => onStatusChange(event.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created</span>
                  <span>{formatDateTime(appointment.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Updated</span>
                  <span>{formatDateTime(appointment.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="dialog-footer button-row">
              <button className="btn btn-secondary" type="button" onClick={onEdit}>
                Edit
              </button>
              <button
                className="btn btn-destructive"
                type="button"
                onClick={() => setConfirmOpen(true)}
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete appointment?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete()
        }}
      />
    </>
  )
}
