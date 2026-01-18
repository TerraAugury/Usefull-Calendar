import { getMonthGridDays, toDateCell } from '../utils/calendar'
import CountryBadge from './CountryBadge'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthGrid({
  year,
  monthIndex,
  appointmentsByDate,
  categoriesById,
  todayDateStr,
  showPast,
  getCountryForDate,
  onSelectDate,
}) {
  const days = getMonthGridDays(year, monthIndex, 1).map((date) =>
    toDateCell(date, monthIndex),
  )

  return (
    <div className="calendar-grid calendar-grid--month">
      {WEEKDAYS.map((day) => (
        <div key={day} className="calendar-weekday">
          {day}
        </div>
      ))}
      {days.map((day) => {
        const appointments = appointmentsByDate.get(day.dateStr) ?? []
        const isPast = todayDateStr ? day.dateStr < todayDateStr : false
        const showIndicators = appointments.length > 0 && (showPast || !isPast)
        const dots = showIndicators ? appointments.slice(0, 3) : []
        const extra = showIndicators ? appointments.length - dots.length : 0
        const country = getCountryForDate ? getCountryForDate(day.dateStr) : null
        return (
          <button
            key={day.dateStr}
            type="button"
            className={`calendar-day${day.isCurrentMonth ? '' : ' is-outside'}${
              isPast ? ' is-past' : ''
            }${day.dateStr === todayDateStr ? ' is-today' : ''}`}
            onClick={() => onSelectDate(day.dateStr)}
            data-date={day.dateStr}
            aria-label={day.date.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          >
            <span className="calendar-day__number">{day.day}</span>
            <div className="calendar-day__dots">
              {dots.map((appointment) => {
                const category = categoriesById.get(appointment.categoryId)
                const accent = category?.color
                  ? `var(--c-${category.color})`
                  : 'var(--c-gray)'
                return (
                  <span
                    key={appointment.id}
                    className="calendar-dot"
                    style={{ '--accent': accent }}
                    aria-hidden="true"
                  />
                )
              })}
              {extra > 0 ? (
                <span className="calendar-more" aria-hidden="true">
                  +{extra}
                </span>
              ) : null}
            </div>
            {country ? (
              <CountryBadge
                country={country}
                className="calendar-day__country"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
