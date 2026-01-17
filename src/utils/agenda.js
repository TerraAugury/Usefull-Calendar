import { DEFAULT_FILTERS } from './constants'
import { getDateKeyFromUtcMs } from './dates'

export function applyFilters(appointments, filters) {
  const search = filters.search.trim().toLowerCase()
  return appointments.filter((appointment) => {
    if (search) {
      const haystack = [
        appointment.title,
        appointment.location,
        appointment.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }
    if (filters.categoryId && filters.categoryId !== 'all') {
      if (appointment.categoryId !== filters.categoryId) return false
    }
    if (filters.dateFrom && appointment.date < filters.dateFrom) {
      return false
    }
    if (filters.dateTo && appointment.date > filters.dateTo) {
      return false
    }
    return true
  })
}

export function splitAndSortAppointments(appointments, now = new Date()) {
  const upcoming = []
  const past = []
  appointments.forEach((appointment) => {
    if (!Number.isFinite(appointment.startUtcMs)) return
    if (appointment.startUtcMs >= now.getTime()) {
      upcoming.push(appointment)
    } else {
      past.push(appointment)
    }
  })
  upcoming.sort((a, b) => {
    return a.startUtcMs - b.startUtcMs
  })
  past.sort((a, b) => {
    return b.startUtcMs - a.startUtcMs
  })
  return { upcoming, past }
}

export function groupByDate(appointments) {
  const groups = []
  let current = null
  appointments.forEach((appointment) => {
    const key = getDateKeyFromUtcMs(
      appointment.startUtcMs,
      appointment.timeMode,
      appointment.timeZone,
    )
    if (key !== current) {
      current = key
      groups.push({ date: current, items: [] })
    }
    groups[groups.length - 1].items.push(appointment)
  })
  return groups
}

export function areFiltersActive(filters) {
  return (
    filters.search.trim() !== DEFAULT_FILTERS.search ||
    filters.categoryId !== DEFAULT_FILTERS.categoryId ||
    filters.dateFrom !== DEFAULT_FILTERS.dateFrom ||
    filters.dateTo !== DEFAULT_FILTERS.dateTo
  )
}
