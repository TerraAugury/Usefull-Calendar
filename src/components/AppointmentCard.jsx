import { getDefaultCategoryIcon } from '../data/sampleData'
import { formatTimeRange } from '../utils/dates'
import CategoryPill from './CategoryPill'

const DEFAULT_ICON = getDefaultCategoryIcon()

export default function AppointmentCard({ appointment, category, onClick }) {
  const accent = category?.color ? `var(--c-${category.color})` : 'var(--c-gray)'
  const timeLabel = formatTimeRange(appointment.startTime, appointment.endTime)
  const zoneLabel =
    appointment.timeMode === 'timezone' && appointment.timeZone
      ? ` (${appointment.timeZone})`
      : ''
  return (
    <button
      className="appointment-card"
      style={{ '--accent': accent }}
      onClick={onClick}
      type="button"
      data-appointment-id={appointment.id}
    >
      <div className="appointment-accent" />
      <div className="appointment-body">
        <h3 className="appointment-title">{appointment.title}</h3>
        <div className="appointment-meta">
          <span>
            {timeLabel}
            {zoneLabel}
          </span>
          {appointment.location ? <span> - {appointment.location}</span> : null}
        </div>
        <CategoryPill name={category?.name ?? 'Unassigned'} />
        <span className="status-badge">{appointment.status}</span>
      </div>
      <div className="appointment-emoji" aria-hidden="true">
        <span className="appointment-emoji__icon">
          {category?.icon ?? DEFAULT_ICON}
        </span>
      </div>
    </button>
  )
}
