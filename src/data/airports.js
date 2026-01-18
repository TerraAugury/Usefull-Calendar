import { AIRPORTS as GENERATED_AIRPORTS } from './airports.generated'

const UNKNOWN_AIRPORT = {
  countryCode: 'UN',
  countryName: 'Unknown',
  timeZone: null,
}

const MANUAL_OVERRIDES = {
  LCA: { countryCode: 'CY', countryName: 'Cyprus', timeZone: 'Asia/Nicosia' },
  PFO: { countryCode: 'CY', countryName: 'Cyprus', timeZone: 'Asia/Nicosia' },
  ECN: { countryCode: 'CY', countryName: 'Cyprus', timeZone: 'Asia/Nicosia' },
}

export const AIRPORTS = { ...GENERATED_AIRPORTS, ...MANUAL_OVERRIDES }

export function getAirportInfo(iata) {
  if (!iata || typeof iata !== 'string') return UNKNOWN_AIRPORT
  const code = iata.trim().toUpperCase()
  return AIRPORTS[code] ?? UNKNOWN_AIRPORT
}

export function countryCodeToFlagEmoji(code) {
  if (!code || typeof code !== 'string') return ''
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return ''
  if (normalized === 'UN') return ''
  const base = 0x1f1e6
  const chars = normalized.split('').map((char) => base + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...chars)
}
