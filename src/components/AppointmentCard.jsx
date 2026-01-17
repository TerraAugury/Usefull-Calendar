import { formatTimeRange } from '../utils/dates'

export default function AppointmentCard({ appointment, category, onClick }) {
  const accent = category?.color ? `var(--c-${category.color})` : 'var(--c-gray)'
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
          <span>{formatTimeRange(appointment.startTime, appointment.endTime)}</span>
          {appointment.location ? <span>• {appointment.location}</span> : null}
        </div>
        <div className="category-pill">
          <span className="dot" />
          <span>{category?.name ?? 'Unassigned'}</span>
        </div>
        <span className="status-badge">{appointment.status}</span>
      </div>
    </button>
  )
}
