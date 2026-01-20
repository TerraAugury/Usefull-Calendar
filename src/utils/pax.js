import { getAirportInfo, countryCodeToFlagEmoji } from '../data/airports'

export const DEFAULT_PAX_STATE = {
  selectedPaxName: null,
  paxNames: [],
  paxLocations: {},
}

function extractTimeValue(value) {
  if (!value || typeof value !== 'string') return 0
  const match = value.match(/(\d{2}):(\d{2})/)
  if (!match) return 0
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

function getCountryForIata(iata) {
  const info = getAirportInfo(iata)
  return { countryName: info.countryName, countryCode: info.countryCode }
}

export function getPaxCountryForDate(paxFlights = [], dateStr) {
  if (!dateStr || !Array.isArray(paxFlights) || paxFlights.length === 0) {
    return null
  }
  const flights = paxFlights
    .filter((flight) => flight && flight.flightDate && flight.paxName)
    .slice()
    .sort((a, b) => {
      const dateCompare = a.flightDate.localeCompare(b.flightDate)
      if (dateCompare !== 0) return dateCompare
      return extractTimeValue(a.depScheduled) - extractTimeValue(b.depScheduled)
    })

  if (flights.length === 0) return null

  const grouped = new Map()
  flights.forEach((flight) => {
    if (!grouped.has(flight.flightDate)) {
      grouped.set(flight.flightDate, [])
    }
    grouped.get(flight.flightDate).push(flight)
  })

  const dates = Array.from(grouped.keys()).sort()
  const firstDate = dates[0]
  if (dateStr < firstDate) {
    const firstFlight = grouped.get(firstDate)[0]
    return getCountryForIata(firstFlight.fromIata)
  }

  for (let index = 0; index < dates.length; index += 1) {
    const currentDate = dates[index]
    const flightsForDay = grouped.get(currentDate)
    const firstFlight = flightsForDay[0]
    const lastFlight = flightsForDay[flightsForDay.length - 1]
    if (dateStr === currentDate) {
      return getCountryForIata(firstFlight.fromIata)
    }
    const nextDate = dates[index + 1]
    if (!nextDate || dateStr < nextDate) {
      return getCountryForIata(lastFlight.toIata)
    }
  }

  const lastDate = dates[dates.length - 1]
  const lastFlights = grouped.get(lastDate)
  return getCountryForIata(lastFlights[lastFlights.length - 1].toIata)
}

export function formatCountryLabel(country) {
  if (!country || !country.countryName) return { flag: '', label: '' }
  const label = country.countryName
  const flag = countryCodeToFlagEmoji(country.countryCode)
  return { flag, label }
}

export function normalizePaxState(value) {
  const base = { ...DEFAULT_PAX_STATE }
  if (!value || typeof value !== 'object') {
    return { state: base, changed: false }
  }

  let changed = false
  const paxNames = Array.isArray(value.paxNames)
    ? value.paxNames.filter((name) => typeof name === 'string' && name.trim())
    : []
  const locationsInput = value.paxLocations && typeof value.paxLocations === 'object'
    ? value.paxLocations
    : {}
  const locationNames = Object.keys(locationsInput).filter(
    (name) => typeof name === 'string' && name.trim(),
  )
  const combinedNames = Array.from(new Set([...paxNames, ...locationNames]))
  const selectedPaxName =
    typeof value.selectedPaxName === 'string' &&
    combinedNames.includes(value.selectedPaxName)
      ? value.selectedPaxName
      : null

  if (selectedPaxName !== value.selectedPaxName) changed = true
  if (combinedNames.length !== paxNames.length) changed = true

  const paxLocations = {}
  combinedNames.forEach((name) => {
    const entry = locationsInput[name]
    const flights = Array.isArray(entry?.flights)
      ? entry.flights.filter(
          (flight) =>
            flight &&
            typeof flight.paxName === 'string' &&
            typeof flight.flightDate === 'string' &&
            typeof flight.flightNumber === 'string',
        )
      : []
    paxLocations[name] = { flights }
  })

  return {
    state: {
      selectedPaxName,
      paxNames: combinedNames,
      paxLocations,
    },
    changed,
  }
}

export function getPassengerInitials(name) {
  if (!name || typeof name !== 'string') return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0][0] ?? ''
  if (parts.length === 1) {
    const second = parts[0][1] ?? ''
    return `${first}${second}`.toUpperCase()
  }
  const last = parts[parts.length - 1][0] ?? ''
  return `${first}${last}`.toUpperCase()
}
