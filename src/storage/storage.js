import {
  isValidAppointmentShape,
  isValidCategoryShape,
  isValidTimeZone,
} from '../utils/validation'
import { getCategoryIconForName } from '../data/sampleData'
import {
  CALENDAR_GRID_MODES,
  CALENDAR_VIEW_MODES,
  DEFAULT_TIME_ZONE,
  TIME_MODES,
} from '../utils/constants'
import { buildUtcFields } from '../utils/dates'

const STORAGE_KEYS = {
  categories: 'app_categories',
  appointments: 'app_appointments',
  preferences: 'app_preferences',
}

const THEMES = ['system', 'light', 'dark']

function safeParse(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function normalizePreferences(value) {
  if (!value || typeof value !== 'object') {
    return {
      theme: 'system',
      showPast: false,
      timeMode: 'local',
      calendarViewMode: 'agenda',
      calendarGridMode: 'month',
    }
  }
  const theme = THEMES.includes(value.theme) ? value.theme : 'system'
  const showPast = typeof value.showPast === 'boolean' ? value.showPast : false
  const timeMode = TIME_MODES.includes(value.timeMode) ? value.timeMode : 'local'
  const calendarViewMode = CALENDAR_VIEW_MODES.includes(value.calendarViewMode)
    ? value.calendarViewMode
    : 'agenda'
  const calendarGridMode = CALENDAR_GRID_MODES.includes(value.calendarGridMode)
    ? value.calendarGridMode
    : 'month'
  return { theme, showPast, timeMode, calendarViewMode, calendarGridMode }
}

function normalizeCategories(rawCategories) {
  if (!Array.isArray(rawCategories)) return null
  let changed = false
  const categories = rawCategories.map((category) => {
    if (!category || typeof category !== 'object') {
      changed = true
      return category
    }
    const icon =
      typeof category.icon === 'string' && category.icon.trim()
        ? category.icon
        : getCategoryIconForName(category.name)
    if (icon !== category.icon) {
      changed = true
    }
    return { ...category, icon }
  })
  return { categories, changed }
}

function normalizeAppointments(rawAppointments, preferences) {
  if (!Array.isArray(rawAppointments)) return null
  let changed = false
  const fallbackMode = TIME_MODES.includes(preferences?.timeMode)
    ? preferences.timeMode
    : 'local'
  const appointments = rawAppointments.map((appointment) => {
    if (!appointment || typeof appointment !== 'object') {
      changed = true
      return appointment
    }
    const timeMode = TIME_MODES.includes(appointment.timeMode)
      ? appointment.timeMode
      : fallbackMode
    if (timeMode !== appointment.timeMode) changed = true
    let timeZone = appointment.timeZone
    if (timeMode === 'timezone') {
      if (
        typeof timeZone !== 'string' ||
        !timeZone.trim() ||
        !isValidTimeZone(timeZone)
      ) {
        timeZone = DEFAULT_TIME_ZONE
        changed = true
      }
    }
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      timeMode,
      timeZone,
    })
    let next = { ...appointment, timeMode, timeZone, startUtcMs }
    if (appointment.endTime) {
      next.endUtcMs = endUtcMs
    } else if ('endUtcMs' in appointment) {
      changed = true
    }
    if (appointment.startUtcMs !== startUtcMs) {
      changed = true
    }
    if (appointment.endTime && appointment.endUtcMs !== endUtcMs) {
      changed = true
    }
    return next
  })
  return { appointments, changed }
}

export function loadStoredData() {
  if (typeof localStorage === 'undefined') {
    return { categories: null, appointments: null, preferences: null }
  }

  const rawCategories = safeParse(localStorage.getItem(STORAGE_KEYS.categories))
  const rawAppointments = safeParse(localStorage.getItem(STORAGE_KEYS.appointments))
  const rawPreferences = safeParse(localStorage.getItem(STORAGE_KEYS.preferences))

  const normalized = normalizeCategories(rawCategories)
  const categories =
    normalized && normalized.categories.every(isValidCategoryShape)
      ? normalized.categories
      : null

  const categoryIds = categories
    ? new Set(categories.map((category) => category.id))
    : null

  const preferences = normalizePreferences(rawPreferences)
  const normalizedAppointments = normalizeAppointments(rawAppointments, preferences)
  const appointments =
    normalizedAppointments &&
    categoryIds &&
    normalizedAppointments.appointments.every((appointment) =>
      isValidAppointmentShape(appointment, categoryIds),
    )
      ? normalizedAppointments.appointments
      : null

  if (categories && normalized?.changed) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories))
  }
  if (appointments && normalizedAppointments?.changed) {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments))
  }
  if (rawPreferences && JSON.stringify(preferences) !== JSON.stringify(rawPreferences)) {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences))
  }

  return { categories, appointments, preferences }
}

export function saveStoredData({ categories, appointments, preferences }) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories))
  localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments))
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences))
}

export function buildExport({ categories, appointments, preferences }) {
  return JSON.stringify(
    { categories, appointments, preferences },
    null,
    2,
  )
}

export function parseImport(text) {
  const parsed = safeParse(text)
  if (!parsed || typeof parsed !== 'object') return null
  const { categories, appointments, preferences } = parsed
  if (!Array.isArray(categories) || !Array.isArray(appointments)) return null
  const normalized = normalizeCategories(categories)
  if (!normalized || !normalized.categories.every(isValidCategoryShape)) return null
  const normalizedPreferences = normalizePreferences(preferences)
  const normalizedAppointments = normalizeAppointments(
    appointments,
    normalizedPreferences,
  )
  if (!normalizedAppointments) return null
  const categoryIds = new Set(normalized.categories.map((category) => category.id))
  if (
    !normalizedAppointments.appointments.every((appointment) =>
      isValidAppointmentShape(appointment, categoryIds),
    )
  ) {
    return null
  }
  return {
    categories: normalized.categories,
    appointments: normalizedAppointments.appointments,
    preferences: normalizedPreferences,
  }
}

export function applyImport(currentState, text) {
  const parsed = parseImport(text)
  if (!parsed) return currentState
  return {
    ...currentState,
    categories: parsed.categories,
    appointments: parsed.appointments,
    preferences: parsed.preferences,
  }
}
