import { TIMEZONE_OPTIONS, TIMEZONE_SOURCES } from './constants'
import { getDefaultTimezoneForCountry } from '../data/countryTimezones'
import { getPaxCountryForDate } from './pax'

const TIMEZONE_SET = new Set(TIMEZONE_OPTIONS.map((zone) => zone.value))

function normalizeTimeZone(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return TIMEZONE_SET.has(trimmed) ? trimmed : ''
}

function normalizeTimeZoneSource(value) {
  if (typeof value !== 'string') return ''
  return TIMEZONE_SOURCES.includes(value) ? value : ''
}

export function getDeviceTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return normalizeTimeZone(tz)
  } catch {
    return ''
  }
}

export function getInferredTimeZoneFromPax(paxFlights = [], dateStr) {
  if (!dateStr) return ''
  const country = getPaxCountryForDate(paxFlights, dateStr)
  if (!country || !country.countryCode) return ''
  const tz = getDefaultTimezoneForCountry(country.countryCode)
  return normalizeTimeZone(tz)
}

export function resolveTimeZoneState({
  timeMode,
  dateStr,
  paxFlights = [],
  currentTimeZone = '',
  currentSource = '',
  deviceTimeZone = '',
} = {}) {
  if (timeMode !== 'timezone') {
    return { timeZone: '', source: '' }
  }

  const normalizedSource = normalizeTimeZoneSource(currentSource)
  const normalizedCurrent = normalizeTimeZone(currentTimeZone)

  if (normalizedCurrent && normalizedSource === 'manual') {
    return { timeZone: normalizedCurrent, source: 'manual' }
  }

  const inferred = getInferredTimeZoneFromPax(paxFlights, dateStr)
  if (inferred) {
    return { timeZone: inferred, source: 'inferred' }
  }

  if (normalizedCurrent) {
    return { timeZone: normalizedCurrent, source: normalizedSource || 'manual' }
  }

  const preferredDevice = normalizeTimeZone(deviceTimeZone)
  const device = preferredDevice || getDeviceTimeZone()
  if (device) {
    return { timeZone: device, source: 'deviceFallback' }
  }

  return { timeZone: '', source: '' }
}
