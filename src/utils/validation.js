import { CATEGORY_COLORS, STATUS_OPTIONS } from './constants'

export function isValidColor(color) {
  return CATEGORY_COLORS.includes(color)
}

export function isValidStatus(status) {
  return STATUS_OPTIONS.includes(status)
}

export function normalizeName(value) {
  return value.trim().toLowerCase()
}

function toMinutes(value) {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function isValidTimeRange(startTime, endTime) {
  if (!endTime) return true
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  if (start === null || end === null) return false
  return end >= start
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
  return errors
}

export function validateAppointmentInput(values, categories = []) {
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
  if (!isValidTimeRange(values.startTime, values.endTime)) {
    errors.endTime = 'End time must be after start time.'
  }
  return errors
}

export function isValidCategoryShape(item) {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
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
  ]
  if (!required.every((key) => typeof item[key] === 'string' && item[key])) {
    return false
  }
  if (!isValidStatus(item.status)) return false
  if (!isValidTimeRange(item.startTime, item.endTime)) return false
  if (categoryIds && !categoryIds.has(item.categoryId)) return false
  return true
}
