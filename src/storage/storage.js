import {
  isValidAppointmentShape,
  isValidCategoryShape,
} from '../utils/validation'

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
    return { theme: 'system' }
  }
  const theme = THEMES.includes(value.theme) ? value.theme : 'system'
  return { theme }
}

export function loadStoredData() {
  if (typeof localStorage === 'undefined') {
    return { categories: null, appointments: null, preferences: null }
  }

  const rawCategories = safeParse(localStorage.getItem(STORAGE_KEYS.categories))
  const rawAppointments = safeParse(localStorage.getItem(STORAGE_KEYS.appointments))
  const rawPreferences = safeParse(localStorage.getItem(STORAGE_KEYS.preferences))

  const categories =
    Array.isArray(rawCategories) && rawCategories.every(isValidCategoryShape)
      ? rawCategories
      : null

  const categoryIds = categories
    ? new Set(categories.map((category) => category.id))
    : null

  const appointments =
    Array.isArray(rawAppointments) &&
    categoryIds &&
    rawAppointments.every((appointment) =>
      isValidAppointmentShape(appointment, categoryIds),
    )
      ? rawAppointments
      : null

  const preferences = normalizePreferences(rawPreferences)

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
  if (!categories.every(isValidCategoryShape)) return null
  const categoryIds = new Set(categories.map((category) => category.id))
  if (
    !appointments.every((appointment) =>
      isValidAppointmentShape(appointment, categoryIds),
    )
  ) {
    return null
  }
  const normalizedPreferences = normalizePreferences(preferences)
  return {
    categories,
    appointments,
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
