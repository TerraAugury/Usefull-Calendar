import { getAirportInfo } from '../data/airports'
import { DEFAULT_TIME_ZONE } from './constants'
import { getDateKeyFromUtcMs, getTimeStringFromUtcMs, zonedDateTimeToUtcMs } from './dates'
import { createId } from './id'

function hasOffset(value) {
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value)
}

function extractDateTimeParts(value) {
  if (!value || typeof value !== 'string') return null
  const match = value.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})/)
  if (!match) return null
  return { dateStr: match[1], timeStr: `${match[2]}:${match[3]}` }
}

function deriveDateFromScheduled(value) {
  if (!value || typeof value !== 'string') return ''
  const match = value.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

function normalizePaxNames(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((name) => typeof name === 'string')
    .map((name) => name.trim())
    .filter(Boolean)
}

export function normalizeFlightRecord(record) {
  if (!record || typeof record !== 'object') return null
  if (
    Array.isArray(record.paxNames) &&
    typeof record.flightNumber === 'string' &&
    typeof record.fromIata === 'string' &&
    typeof record.toIata === 'string' &&
    typeof record.depScheduled === 'string' &&
    typeof record.arrScheduled === 'string'
  ) {
    const paxNames = normalizePaxNames(record.paxNames)
    if (paxNames.length === 0) return null
    const flightDate =
      typeof record.flightDate === 'string' && record.flightDate.trim()
        ? record.flightDate.trim()
        : deriveDateFromScheduled(record.depScheduled)
    if (!flightDate) return null
    return {
      paxNames,
      pnr: record.pnr ?? null,
      flightDate,
      airline: record.airline ?? '',
      flightNumber: record.flightNumber.trim(),
      fromIata: record.fromIata.trim().toUpperCase(),
      toIata: record.toIata.trim().toUpperCase(),
      depScheduled: record.depScheduled,
      arrScheduled: record.arrScheduled,
      fromAirportName: record.fromAirportName ?? '',
      fromCityName: record.fromCityName ?? '',
      toAirportName: record.toAirportName ?? '',
      toCityName: record.toCityName ?? '',
    }
  }
  const paxNames = normalizePaxNames(record.paxNames)
  if (paxNames.length === 0) return null

  const route = record.route ?? {}
  const departure = route.departure ?? {}
  const arrival = route.arrival ?? {}
  const flightNumber = String(
    route.flightNumber ?? record.flight?.flightNumber ?? '',
  ).trim()
  if (!flightNumber) return null

  const airline = String(route.airline ?? record.flight?.airline?.name ?? '').trim()
  const fromIata = typeof departure.iata === 'string'
    ? departure.iata.trim().toUpperCase()
    : ''
  const toIata = typeof arrival.iata === 'string'
    ? arrival.iata.trim().toUpperCase()
    : ''
  const depScheduled = typeof departure.scheduled === 'string'
    ? departure.scheduled
    : ''
  const arrScheduled = typeof arrival.scheduled === 'string'
    ? arrival.scheduled
    : ''
  if (!fromIata || !toIata || !depScheduled || !arrScheduled) return null

  const flightDate = typeof record.flightDate === 'string' && record.flightDate.trim()
    ? record.flightDate.trim()
    : deriveDateFromScheduled(depScheduled)
  if (!flightDate) return null

  return {
    paxNames,
    pnr: record.pnr ?? null,
    flightDate,
    airline,
    flightNumber,
    fromIata,
    toIata,
    depScheduled,
    arrScheduled,
    fromAirportName: departure.airportName ?? departure.airport ?? '',
    fromCityName: departure.cityName ?? '',
    toAirportName: arrival.airportName ?? arrival.airport ?? '',
    toCityName: arrival.cityName ?? '',
  }
}

function parseScheduled(value, timeZone) {
  if (!value || typeof value !== 'string') return null
  if (hasOffset(value)) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    const utcMs = parsed.getTime()
    return {
      utcMs,
      dateStr: getDateKeyFromUtcMs(utcMs, 'timezone', timeZone),
      timeStr: getTimeStringFromUtcMs(utcMs, timeZone),
    }
  }
  const parts = extractDateTimeParts(value)
  if (!parts || !timeZone) return null
  const utcMs = zonedDateTimeToUtcMs({
    dateStr: parts.dateStr,
    timeStr: parts.timeStr,
    timeZone,
  })
  if (!Number.isFinite(utcMs)) return null
  return { utcMs, ...parts }
}

function buildFlightNotes(record) {
  const parts = []
  if (record.airline) parts.push(`Airline: ${record.airline}`)
  if (record.pnr) parts.push(`PNR: ${record.pnr}`)
  const depDetails = [
    record.fromCityName,
    record.fromAirportName,
    record.fromIata,
  ]
    .filter(Boolean)
    .join(', ')
  const arrDetails = [
    record.toCityName,
    record.toAirportName,
    record.toIata,
  ]
    .filter(Boolean)
    .join(', ')
  if (depDetails) parts.push(`From: ${depDetails}`)
  if (arrDetails) parts.push(`To: ${arrDetails}`)
  return parts.join('\n')
}

export function extractPaxNames(trips) {
  if (!Array.isArray(trips)) return []
  const names = new Set()
  trips.forEach((trip) => {
    if (!trip || !Array.isArray(trip.records)) return
    trip.records.forEach((record) => {
      const normalized = normalizeFlightRecord(record)
      if (!normalized) return
      normalized.paxNames.forEach((name) => {
        names.add(name)
      })
    })
  })
  return Array.from(names).sort((a, b) => a.localeCompare(b))
}

export function getTripImportStats(trips) {
  if (!Array.isArray(trips)) {
    return { tripCount: 0, recordCount: 0, flightCount: 0 }
  }
  let recordCount = 0
  let flightCount = 0
  trips.forEach((trip) => {
    if (!trip || !Array.isArray(trip.records)) return
    recordCount += trip.records.length
    trip.records.forEach((record) => {
      if (normalizeFlightRecord(record)) {
        flightCount += 1
      }
    })
  })
  return { tripCount: trips.length, recordCount, flightCount }
}

export function collectFlightsForPax(trips, paxName) {
  if (!Array.isArray(trips) || typeof paxName !== 'string') return []
  const targetName = paxName.trim()
  if (!targetName) return []
  const records = []
  trips.forEach((trip) => {
    if (!trip || !Array.isArray(trip.records)) return
    trip.records.forEach((record) => {
      const normalized = normalizeFlightRecord(record)
      if (!normalized) return
      const hasPax = normalized.paxNames.includes(targetName)
      if (!hasPax) return
      records.push(normalized)
    })
  })
  return records
}

export function buildImportedFlight(record, paxName) {
  const normalized = record ? normalizeFlightRecord(record) : null
  if (!normalized) return null
  const { flightNumber, fromIata, toIata } = normalized
  const depInfo = getAirportInfo(fromIata)
  const arrInfo = getAirportInfo(toIata)
  const depTimeZone = depInfo.timeZone ?? DEFAULT_TIME_ZONE
  const arrTimeZone = arrInfo.timeZone ?? depTimeZone ?? DEFAULT_TIME_ZONE

  const depScheduled = normalized.depScheduled
  const arrScheduled = normalized.arrScheduled
  const depParsed = parseScheduled(depScheduled, depTimeZone)
  if (!depParsed) return null
  const arrParsed = parseScheduled(arrScheduled, arrTimeZone)

  const endUtcMs = arrParsed?.utcMs ?? null
  const endTime = endUtcMs ? getTimeStringFromUtcMs(endUtcMs, depTimeZone) : ''
  const airlineName = normalized.airline ?? ''
  const importedFlight = {
    id: createId('flight_'),
    paxName,
    flightDate: normalized.flightDate,
    pnr: normalized.pnr ?? null,
    airline: airlineName,
    flightNumber,
    fromIata,
    toIata,
    depScheduled,
    arrScheduled,
  }

  const appointment = {
    title: `Flight ${flightNumber} ${fromIata} \u2192 ${toIata}`,
    date: normalized.flightDate,
    startTime: depParsed.timeStr,
    endTime,
    location: `${fromIata} \u2192 ${toIata}`,
    notes: buildFlightNotes(normalized),
    status: 'planned',
    timeMode: 'timezone',
    timeZone: depTimeZone,
    startUtcMs: depParsed.utcMs,
    source: {
      type: 'flight',
      paxName,
      flightNumber,
      fromIata,
      toIata,
      depScheduled,
      arrScheduled,
    },
  }
  if (endUtcMs) {
    appointment.endUtcMs = endUtcMs
  }

  return { importedFlight, appointment }
}

export function buildFlightDedupKey(paxName, flightDate, flightNumber) {
  return `${paxName}__${flightDate}__${flightNumber}`
}

export function dedupeImportedFlights(flights) {
  const seen = new Set()
  return flights.filter((flight) => {
    const key = buildFlightDedupKey(
      flight.paxName,
      flight.flightDate,
      flight.flightNumber,
    )
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
