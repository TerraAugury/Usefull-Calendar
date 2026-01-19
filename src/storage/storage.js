import {
  isValidAppointmentShape,
  isValidCategoryShape,
  isValidTimeZone,
  isValidTimeZoneSource,
} from '../utils/validation'
import { getCategoryIconForName } from '../data/sampleData'
import {
  CALENDAR_GRID_MODES,
  CALENDAR_VIEW_MODES,
  DEFAULT_TIME_ZONE,
  TIME_MODES,
} from '../utils/constants'
import { buildUtcFields } from '../utils/dates'
import { DEFAULT_PAX_STATE, normalizePaxState } from '../utils/pax'
import { getDeviceTimeZone } from '../utils/timezone'
import {
  clearAppointments,
  clearCategories,
  clearPax,
  clearPreferences,
  getAllAppointments,
  getAllCategories,
  getAppointmentsByStartUtcMsRange,
  getAllPaxState,
  getAllPreferences,
  setPaxState,
  setPreferencesBatch,
  upsertAppointmentsBatch,
  upsertCategoriesBatch,
} from './db'

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
      timeMode: 'timezone',
      calendarViewMode: 'agenda',
      calendarGridMode: 'month',
    }
  }
  const theme = THEMES.includes(value.theme) ? value.theme : 'system'
  const showPast = typeof value.showPast === 'boolean' ? value.showPast : false
  const timeMode = TIME_MODES.includes(value.timeMode) ? value.timeMode : 'timezone'
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
    : 'timezone'
  const deviceTimeZone = getDeviceTimeZone()
  const fallbackTimeZone = deviceTimeZone || DEFAULT_TIME_ZONE
  const fallbackSource = deviceTimeZone ? 'deviceFallback' : 'manual'
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
    let timeZoneSource = appointment.timeZoneSource
    if (timeMode === 'timezone') {
      const hasValidTimeZone =
        typeof timeZone === 'string' && timeZone.trim() && isValidTimeZone(timeZone)
      if (!hasValidTimeZone) {
        timeZone = fallbackTimeZone
        timeZoneSource = fallbackSource
        changed = true
      } else if (
        typeof timeZoneSource !== 'string' ||
        !timeZoneSource.trim() ||
        !isValidTimeZoneSource(timeZoneSource)
      ) {
        timeZoneSource = 'manual'
        changed = true
      }
    } else {
      if (appointment.timeZone || appointment.timeZoneSource) {
        changed = true
      }
      timeZone = undefined
      timeZoneSource = undefined
    }
    const { startUtcMs, endUtcMs } = buildUtcFields({
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      timeMode,
      timeZone,
    })
    let next = { ...appointment, timeMode, timeZone, timeZoneSource, startUtcMs }
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
    if (timeMode !== 'timezone') {
      delete next.timeZone
      delete next.timeZoneSource
    }
    return next
  })
  return { appointments, changed }
}

export async function loadStoredData() {
  const empty = {
    categories: null,
    appointments: null,
    preferences: null,
    pax: null,
  }

  let rawCategories = null
  let rawAppointments = null
  let rawPreferences = null
  let rawPax = null

  try {
    const [categories, appointments, preferences, pax] = await Promise.all([
      getAllCategories(),
      getAllAppointments(),
      getAllPreferences(),
      getAllPaxState(),
    ])
    rawCategories = Array.isArray(categories) && categories.length ? categories : null
    rawAppointments = Array.isArray(appointments) ? appointments : null
    rawPreferences =
      preferences && Object.keys(preferences).length ? preferences : null
    rawPax = pax && Object.keys(pax).length ? pax : null
  } catch {
    return empty
  }

  const normalized = normalizeCategories(rawCategories)
  const categories =
    normalized &&
    normalized.categories.length > 0 &&
    normalized.categories.every(isValidCategoryShape)
      ? normalized.categories
      : null

  const categoryIds = categories
    ? new Set(categories.map((category) => category.id))
    : null

  const preferences = rawPreferences ? normalizePreferences(rawPreferences) : null
  const normalizedAppointments = normalizeAppointments(
    rawAppointments,
    preferences ?? {},
  )
  const appointments =
    normalizedAppointments &&
    categoryIds &&
    normalizedAppointments.appointments.every((appointment) =>
      isValidAppointmentShape(appointment, categoryIds),
    )
      ? normalizedAppointments.appointments
      : null

  if (categories && normalized?.changed) {
    await upsertCategoriesBatch(categories)
  }
  if (appointments && normalizedAppointments?.changed) {
    await upsertAppointmentsBatch(appointments)
  }
  if (
    rawPreferences &&
    preferences &&
    JSON.stringify(preferences) !== JSON.stringify(rawPreferences)
  ) {
    await setPreferencesBatch(preferences)
  }

  const paxNormalized = normalizePaxState(rawPax ?? DEFAULT_PAX_STATE)
  if (rawPax && paxNormalized.changed) {
    await clearPax()
    await Promise.all(
      Object.entries(paxNormalized.state).map(([key, value]) =>
        setPaxState(key, value),
      ),
    )
  }

  return {
    categories,
    appointments,
    preferences,
    pax: paxNormalized.state,
  }
}

export async function saveStoredData({
  categories,
  appointments,
  preferences,
  pax,
}) {
  const writes = []
  if (Array.isArray(categories)) {
    writes.push(upsertCategoriesBatch(categories))
  }
  if (Array.isArray(appointments)) {
    writes.push(upsertAppointmentsBatch(appointments))
  }
  if (preferences && typeof preferences === 'object') {
    writes.push(setPreferencesBatch(preferences))
  }
  if (pax && typeof pax === 'object') {
    writes.push(
      Promise.all(
        Object.entries(pax).map(([key, value]) => setPaxState(key, value)),
      ),
    )
  }
  await Promise.all(writes)
}

export async function buildExport() {
  const [categories, appointments, preferences, pax] = await Promise.all([
    getAllCategories(),
    getAllAppointments(),
    getAllPreferences(),
    getAllPaxState(),
  ])
  const normalizedPreferences = normalizePreferences(preferences)
  const normalizedPax = normalizePaxState(pax ?? DEFAULT_PAX_STATE)
  return JSON.stringify(
    {
      categories,
      appointments,
      preferences: normalizedPreferences,
      pax: normalizedPax.state,
    },
    null,
    2,
  )
}

export async function loadAppointmentsForDateRange(startMs, endMs) {
  const [categories, preferences, appointments] = await Promise.all([
    getAllCategories(),
    getAllPreferences(),
    getAppointmentsByStartUtcMsRange(startMs, endMs),
  ])

  const categoryIds = new Set((categories ?? []).map((category) => category.id))
  const normalizedPrefs = normalizePreferences(preferences ?? {})
  const normalized = normalizeAppointments(appointments ?? [], normalizedPrefs)
  if (!normalized) return []

  return normalized.appointments
    .filter((appointment) => isValidAppointmentShape(appointment, categoryIds))
    .sort((a, b) => (a.startUtcMs ?? 0) - (b.startUtcMs ?? 0))
}

export function parseImport(text) {
  const parsed = safeParse(text)
  if (!parsed || typeof parsed !== 'object') return null
  const { categories, appointments, preferences, pax } = parsed
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
  const normalizedPax = normalizePaxState(pax ?? DEFAULT_PAX_STATE)
  return {
    categories: normalized.categories,
    appointments: normalizedAppointments.appointments,
    preferences: normalizedPreferences,
    pax: normalizedPax.state,
  }
}

export async function applyImport(currentState, text) {
  const parsed = parseImport(text)
  if (!parsed) return currentState
  await Promise.all([
    clearCategories(),
    clearAppointments(),
    clearPreferences(),
    clearPax(),
  ])
  await Promise.all([
    upsertCategoriesBatch(parsed.categories),
    upsertAppointmentsBatch(parsed.appointments),
    setPreferencesBatch(parsed.preferences),
    Promise.all(
      Object.entries(parsed.pax ?? DEFAULT_PAX_STATE).map(([key, value]) =>
        setPaxState(key, value),
      ),
    ),
  ])
  if (!currentState) return parsed
  return {
    ...currentState,
    categories: parsed.categories,
    appointments: parsed.appointments,
    preferences: parsed.preferences,
    pax: parsed.pax ?? currentState.pax,
  }
}
