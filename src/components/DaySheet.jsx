import * as Dialog from '@radix-ui/react-dialog'
import AppointmentCard from './AppointmentCard'
import CountryBadge from './CountryBadge'
import { formatDateLabel } from '../utils/dates'
import { IconClose } from './Icons'

export default function DaySheet({
  open,
  onOpenChange,
  date,
  country,
  appointments,
  categoriesById,
  onSelectAppointment,
}) {
  if (!date) return null
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content day-sheet">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{formatDateLabel(date)}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close day view">
                <IconClose className="tab-icon" />
              </button>
            </Dialog.Close>
          </div>
          {country ? (
            <CountryBadge country={country} className="day-sheet__country" />
          ) : null}
          <Dialog.Description className="sr-only">
            Appointments scheduled for this day.
          </Dialog.Description>
          <div className="dialog-body">
            {appointments.length > 0 ? (
              <div className="day-sheet-list">
                {appointments.map((appointment) => {
                  const category = categoriesById.get(appointment.categoryId)
                  return (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      category={category}
                      onClick={() => onSelectAppointment(appointment)}
                    />
                  )
                })}
              </div>
            ) : (
              <p className="helper-text">No appointments for this day.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
