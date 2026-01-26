export function formatDateLabel(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime) return ''
  if (!endTime) return startTime
  return `${startTime} - ${endTime}`
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeStringToMinutes(value) {
  if (!value) return null
  const [hour, minute] = value.split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return hour * 60 + minute
}

export function formatDateYYYYMMDD(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  return formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function getTodayYYYYMMDD({ mode = 'timezone', timeZone, now = new Date() } = {}) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return ''
  if (mode === 'timezone' && timeZone) {
    const formatter = getDateFormatter(timeZone)
    const parts = getPartsMap(formatter, now)
    const year = Number(parts.year)
    const month = Number(parts.month)
    const day = Number(parts.day)
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return ''
    }
    return formatDateKey(year, month, day)
  }
  return formatDateYYYYMMDD(now)
}

export function getNowTimeHHMM({
  mode = 'timezone',
  timeZone,
  now = new Date(),
  stepMinutes = 1,
} = {}) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return ''
  let hour = null
  let minute = null
  if (mode === 'timezone' && timeZone) {
    const formatter = getDateTimeFormatter(timeZone)
    const parts = getPartsMap(formatter, now)
    hour = Number(parts.hour)
    minute = Number(parts.minute)
  } else {
    hour = now.getHours()
    minute = now.getMinutes()
  }
  if (Number.isNaN(hour) || Number.isNaN(minute)) return ''
  const step = Math.max(1, stepMinutes)
  const total = hour * 60 + minute
  const rounded = Math.ceil(total / step) * step
  const clamped = Math.min(rounded, 24 * 60 - 1)
  const finalHour = Math.floor(clamped / 60)
  const finalMinute = clamped % 60
  const hh = String(finalHour).padStart(2, '0')
  const mm = String(finalMinute).padStart(2, '0')
  return `${hh}:${mm}`
}

export function getLocalDateTime(dateString, timeString) {
  if (!dateString || !timeString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  const [hour, minute] = timeString.split(':').map(Number)
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null
  }
  return new Date(year, month - 1, day, hour, minute, 0, 0)
}

const dateTimeFormatterCache = new Map()
const dateFormatterCache = new Map()

function getDateTimeFormatter(timeZone) {
  if (!dateTimeFormatterCache.has(timeZone)) {
    dateTimeFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }),
    )
  }
  return dateTimeFormatterCache.get(timeZone)
}

function getDateFormatter(timeZone) {
  if (!dateFormatterCache.has(timeZone)) {
    dateFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    )
  }
  return dateFormatterCache.get(timeZone)
}

function getPartsMap(formatter, date) {
  const parts = formatter.formatToParts(date)
  return parts.reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})
}

function formatDateKey(year, month, day) {
  const yyyy = String(year).padStart(4, '0')
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function addDaysToDateKey(dateStr, days = 1) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    !Number.isFinite(days)
  ) {
    return ''
  }
  const next = new Date(Date.UTC(year, month - 1, day + days))
  if (Number.isNaN(next.getTime())) return ''
  return formatDateKey(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())
}

function getOffsetMs(utcMs, timeZone) {
  const formatter = getDateTimeFormatter(timeZone)
  const parts = getPartsMap(formatter, new Date(utcMs))
  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  const second = Number(parts.second)
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    Number.isNaN(second)
  ) {
    return 0
  }
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  return asUtc - utcMs
}

export function zonedDateTimeToUtcMs({ dateStr, timeStr, timeZone }) {
  if (!dateStr || !timeStr || !timeZone) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null
  }
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
  const offset = getOffsetMs(utcGuess, timeZone)
  let utcMs = utcGuess - offset
  const offset2 = getOffsetMs(utcMs, timeZone)
  if (offset2 !== offset) {
    utcMs = utcGuess - offset2
  }
  return utcMs
}

export function buildUtcFields({ date, startTime, endTime, timeMode, timeZone }) {
  if (!date || !startTime) return { startUtcMs: null, endUtcMs: null }
  let startUtcMs = null
  if (timeMode === 'timezone') {
    startUtcMs = zonedDateTimeToUtcMs({
      dateStr: date,
      timeStr: startTime,
      timeZone,
    })
  } else {
    const start = getLocalDateTime(date, startTime)
    startUtcMs = start ? start.getTime() : null
  }
  if (!Number.isFinite(startUtcMs)) {
    return { startUtcMs: null, endUtcMs: null }
  }
  let endUtcMs = null
  if (endTime) {
    if (timeMode === 'timezone') {
      endUtcMs = zonedDateTimeToUtcMs({
        dateStr: date,
        timeStr: endTime,
        timeZone,
      })
    } else {
      const end = getLocalDateTime(date, endTime)
      endUtcMs = end ? end.getTime() : null
    }
    if (Number.isFinite(endUtcMs) && endUtcMs < startUtcMs) {
      const nextDate = addDaysToDateKey(date, 1)
      if (nextDate) {
        if (timeMode === 'timezone') {
          endUtcMs = zonedDateTimeToUtcMs({
            dateStr: nextDate,
            timeStr: endTime,
            timeZone,
          })
        } else {
          const end = getLocalDateTime(nextDate, endTime)
          endUtcMs = end ? end.getTime() : null
        }
      }
    }
  }
  return { startUtcMs, endUtcMs }
}

export function getDateKeyFromUtcMs(utcMs, timeMode, timeZone) {
  if (!Number.isFinite(utcMs)) return ''
  if (timeMode === 'timezone' && timeZone) {
    const formatter = getDateFormatter(timeZone)
    const parts = getPartsMap(formatter, new Date(utcMs))
    const year = Number(parts.year)
    const month = Number(parts.month)
    const day = Number(parts.day)
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return ''
    }
    return formatDateKey(year, month, day)
  }
  const date = new Date(utcMs)
  return formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function getTimeStringFromUtcMs(utcMs, timeZone) {
  if (!Number.isFinite(utcMs) || !timeZone) return ''
  const formatter = getDateTimeFormatter(timeZone)
  const parts = getPartsMap(formatter, new Date(utcMs))
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return ''
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return `${hh}:${mm}`
}
