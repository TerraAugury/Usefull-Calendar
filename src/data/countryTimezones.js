const COUNTRY_TIMEZONES = {
  CY: 'Asia/Nicosia',
  GB: 'Europe/London',
  IE: 'Europe/Dublin',
  FR: 'Europe/Paris',
  DE: 'Europe/Berlin',
  CH: 'Europe/Zurich',
  IT: 'Europe/Rome',
  ES: 'Europe/Madrid',
  PT: 'Europe/Lisbon',
  NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels',
  AT: 'Europe/Vienna',
  CZ: 'Europe/Prague',
  SK: 'Europe/Bratislava',
  PL: 'Europe/Warsaw',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen',
  FI: 'Europe/Helsinki',
  GR: 'Europe/Athens',
  HR: 'Europe/Zagreb',
  SI: 'Europe/Ljubljana',
  EE: 'Europe/Tallinn',
  LV: 'Europe/Riga',
  LT: 'Europe/Vilnius',
  LU: 'Europe/Luxembourg',
  MT: 'Europe/Malta',
  IS: 'Atlantic/Reykjavik',
  RO: 'Europe/Bucharest',
  BG: 'Europe/Sofia',
  HU: 'Europe/Budapest',
  RS: 'Europe/Belgrade',
  TR: 'Europe/Istanbul',
}

export function getDefaultTimezoneForCountry(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') return null
  const key = countryCode.trim().toUpperCase()
  return COUNTRY_TIMEZONES[key] ?? null
}

export { COUNTRY_TIMEZONES }
