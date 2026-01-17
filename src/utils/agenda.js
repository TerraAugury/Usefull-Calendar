import { DEFAULT_FILTERS } from './constants'

function compareDateTime(a, b) {
  const aKey = `${a.date}T${a.startTime}`
  const bKey = `${b.date}T${b.startTime}`
  if (aKey < bKey) return -1
  if (aKey > bKey) return 1
  return 0
}

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

export function sortAppointments(appointments, categories, sortKey) {
  const categoryLookup = new Map(
    categories.map((category) => [category.id, category.name.toLowerCase()]),
  )
  const sorted = [...appointments]
  sorted.sort((a, b) => {
    const primary = compareDateTime(a, b)
    if (sortKey === 'date-desc') return -primary
    if (sortKey === 'category') {
      const dateCompare = primary
      if (dateCompare !== 0) return dateCompare
      const aName = categoryLookup.get(a.categoryId) ?? ''
      const bName = categoryLookup.get(b.categoryId) ?? ''
      if (aName < bName) return -1
      if (aName > bName) return 1
      return 0
    }
    if (sortKey === 'created') {
      const dateCompare = primary
      if (dateCompare !== 0) return dateCompare
      if (a.createdAt < b.createdAt) return -1
      if (a.createdAt > b.createdAt) return 1
      return 0
    }
    return primary
  })
  return sorted
}

export function groupByDate(appointments) {
  const groups = []
  let current = null
  appointments.forEach((appointment) => {
    if (appointment.date !== current) {
      current = appointment.date
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
    filters.dateTo !== DEFAULT_FILTERS.dateTo ||
    filters.sort !== DEFAULT_FILTERS.sort
  )
}
