import {
  CATEGORY_COLORS,
  STATUS_OPTIONS,
  TIMEZONE_SOURCES,
  TIMEZONE_OPTIONS,
  TIMEZONE_VALUE_SET,
  TIME_MODES,
} from './constants'
import { buildUtcFields, timeStringToMinutes } from './dates'

export function isValidColor(color) {
  return CATEGORY_COLORS.includes(color)
}

export function isValidStatus(status) {
  return STATUS_OPTIONS.includes(status)
}

export function normalizeName(value) {
  return value.trim().toLowerCase()
}

export function isValidTimeRange(startTime, endTime) {
  if (!endTime) return true
  const start = timeStringToMinutes(startTime)
  const end = timeStringToMinutes(endTime)
  if (start === null || end === null) return false
  return end >= start
}

export function isValidTimeMode(value) {
  return TIME_MODES.includes(value)
}

export function isValidTimeZone(value) {
  return TIMEZONE_VALUE_SET.has(value)
}

export function isValidTimeZoneSource(value) {
  return TIMEZONE_SOURCES.includes(value)
}

export function isAppointmentStartInPast(values, now = new Date(), timeMode = 'timezone') {
  const { startUtcMs } = buildUtcFields({
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    timeMode,
    timeZone: values.timeZone,
  })
  if (!Number.isFinite(startUtcMs)) return false
  return startUtcMs < now.getTime()
}

export function validateCategoryInput(values, existing = []) {
  const errors = {}
  const name = values.name?.trim() ?? ''
  if (!name) {
    errors.name = 'Name is required.'
  } else {
    const normalized = normalizeName(name)
    const isDuplicate = existing.some(
      (category) => normalizeName(category.name) === normalized,
    )
    if (isDuplicate) {
      errors.name = 'Name must be unique.'
    }
  }
  if (!isValidColor(values.color)) {
    errors.color = 'Select a color from the palette.'
  }
  if (!values.icon || !values.icon.trim()) {
    errors.icon = 'Select an icon.'
  }
  return errors
}

export function validateAppointmentInput(
  values,
  categories = [],
  now = new Date(),
  timeMode = 'timezone',
) {
  const errors = {}
  if (!values.title?.trim()) {
    errors.title = 'Title is required.'
  }
  if (!values.date) {
    errors.date = 'Date is required.'
  }
  if (!values.startTime) {
    errors.startTime = 'Start time is required.'
  }
  if (!values.categoryId) {
    errors.categoryId = 'Category is required.'
  } else if (!categories.some((cat) => cat.id === values.categoryId)) {
    errors.categoryId = 'Select a valid category.'
  }
  if (timeMode === 'timezone') {
    if (!values.timeZone) {
      errors.timeZone = 'Timezone is required.'
    } else if (!isValidTimeZone(values.timeZone)) {
      errors.timeZone = 'Select a European timezone.'
    }
  }
  if (!isValidTimeRange(values.startTime, values.endTime)) {
    errors.endTime = 'End time must be after start time.'
  }
  const { startUtcMs, endUtcMs } = buildUtcFields({
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    timeMode,
    timeZone: values.timeZone,
  })
  if (values.endTime && Number.isFinite(startUtcMs)) {
    if (!Number.isFinite(endUtcMs) || endUtcMs < startUtcMs) {
      errors.endTime = 'End time must be after start time.'
    }
  }
  if (isAppointmentStartInPast(values, now, timeMode)) {
    if (!errors.startTime) {
      errors.startTime = 'Appointments cannot be in the past.'
    }
  }
  return errors
}

export function isValidCategoryShape(item) {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.icon === 'string' &&
    item.icon.trim() !== '' &&
    isValidColor(item.color)
  )
}

export function isValidAppointmentShape(item, categoryIds = null) {
  if (!item || typeof item !== 'object') return false
  const required = [
    'id',
    'title',
    'date',
    'startTime',
    'categoryId',
    'status',
    'createdAt',
    'updatedAt',
    'timeMode',
  ]
  if (!required.every((key) => typeof item[key] === 'string' && item[key])) {
    return false
  }
  if (!isValidTimeMode(item.timeMode)) return false
  if (!Number.isFinite(item.startUtcMs)) return false
  if (item.timeMode === 'timezone') {
    if (typeof item.timeZone !== 'string' || !isValidTimeZone(item.timeZone)) {
      return false
    }
    if (
      typeof item.timeZoneSource !== 'string' ||
      !isValidTimeZoneSource(item.timeZoneSource)
    ) {
      return false
    }
  }
  if (!isValidStatus(item.status)) return false
  if (!isValidTimeRange(item.startTime, item.endTime)) return false
  if (item.endTime) {
    if (!Number.isFinite(item.endUtcMs) || item.endUtcMs < item.startUtcMs) {
      return false
    }
  }
  if (categoryIds && !categoryIds.has(item.categoryId)) return false
  return true
}
