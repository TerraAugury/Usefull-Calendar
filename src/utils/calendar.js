import { formatDateYYYYMMDD } from './dates'

const DAY_MS = 24 * 60 * 60 * 1000

function cloneDate(date) {
  return new Date(date.getTime())
}

export function addDays(date, amount) {
  const next = cloneDate(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function startOfWeek(date, weekStartsOn = 1) {
  const next = cloneDate(date)
  const day = next.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  next.setDate(next.getDate() - diff)
  next.setHours(0, 0, 0, 0)
  return next
}

export function getWeekDays(anchorDate, weekStartsOn = 1) {
  const start = startOfWeek(anchorDate, weekStartsOn)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function getWeekRange(anchorDate, weekStartsOn = 1) {
  const days = getWeekDays(anchorDate, weekStartsOn)
  const start = days[0]
  const end = days[6]
  return {
    start,
    end,
    days,
    startStr: formatDateYYYYMMDD(start),
    endStr: formatDateYYYYMMDD(end),
  }
}

export function getMonthGridDays(year, monthIndex, weekStartsOn = 1) {
  const firstOfMonth = new Date(year, monthIndex, 1)
  const lastOfMonth = new Date(year, monthIndex + 1, 0)
  const gridStart = startOfWeek(firstOfMonth, weekStartsOn)
  const gridEnd = addDays(startOfWeek(lastOfMonth, weekStartsOn), 6)
  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / DAY_MS) + 1
  return Array.from({ length: totalDays }, (_, index) => addDays(gridStart, index))
}

export function buildAppointmentDateMap(appointments) {
  const map = new Map()
  appointments.forEach((appointment) => {
    if (!appointment?.date) return
    if (!map.has(appointment.date)) {
      map.set(appointment.date, [])
    }
    map.get(appointment.date).push(appointment)
  })
  map.forEach((items, key) => {
    items.sort((a, b) => (a.startUtcMs ?? 0) - (b.startUtcMs ?? 0))
    map.set(key, items)
  })
  return map
}

export function filterAppointmentsByDateVisibility(
  appointments,
  todayDateStr,
  showPast,
) {
  if (showPast || !todayDateStr) return appointments
  return appointments.filter((appointment) => appointment.date >= todayDateStr)
}

export function filterAppointmentsInWeek({
  appointments,
  weekStartStr,
  weekEndStr,
  showPast,
  nowMs,
}) {
  const filtered = appointments.filter((appointment) => {
    if (!appointment?.date) return false
    if (appointment.date < weekStartStr || appointment.date > weekEndStr) {
      return false
    }
    if (!showPast && Number.isFinite(appointment.startUtcMs)) {
      return appointment.startUtcMs >= nowMs
    }
    return true
  })
  return filtered.sort((a, b) => (a.startUtcMs ?? 0) - (b.startUtcMs ?? 0))
}

export function toDateCell(date, currentMonth) {
  return {
    date,
    dateStr: formatDateYYYYMMDD(date),
    day: date.getDate(),
    isCurrentMonth: date.getMonth() === currentMonth,
  }
}
