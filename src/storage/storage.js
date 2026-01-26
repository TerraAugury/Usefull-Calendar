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
import { db } from './dexieDb'
import {
  clearPax,
  getAllAppointments,
  getAllCategories,
  getAppointmentsByStartUtcMsRange,
  getAllPaxState,
  getAllPreferences,
  runWriteTransaction,
  setPaxBatch,
  setPreferencesBatch,
  STORE_NAMES,
  toKeyValueRecords,
  upsertAppointmentsBatch,
  upsertCategoriesBatch,
} from './db'

const THEMES = ['system', 'light', 'dark']
const FALLBACK_KEY = 'useful_calendar_fallback_v1'

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} color
 * @property {string} [icon]
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} title
 * @property {string} date
 * @property {string} startTime
 * @property {string} [endTime]
 * @property {string} categoryId
 * @property {string} [location]
 * @property {string} [notes]
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [timeMode]
 * @property {string} [timeZone]
 * @property {string} [timeZoneSource]
 * @property {number} [startUtcMs]
 * @property {number} [endUtcMs]
 */

/** @typedef {Record<string, any>} PreferencesMap */
/** @typedef {Record<string, any>} PaxMap */

/**
 * @typedef {Object} ExportSchemaV1
 * @property {number} schemaVersion
 * @property {Category[]} categories
 * @property {Appointment[]} appointments
 * @property {PreferencesMap} preferences
 * @property {PaxMap} pax
 */

function withTimeout(promise, ms) {
  if (!ms || ms <= 0) return promise
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        reject(new Error('Storage timeout'))
      }, ms)
    }),
  ])
}

function safeParse(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function loadFallback() {
  try {
    const storage =
      typeof globalThis !== 'undefined' ? globalThis.localStorage : null
    if (!storage) return null
    const raw = storage.getItem(FALLBACK_KEY)
    const parsed = safeParse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function saveFallback(data) {
  try {
    const storage =
      typeof globalThis !== 'undefined' ? globalThis.localStorage : null
    if (!storage) return
    storage.setItem(FALLBACK_KEY, JSON.stringify(data))
  } catch {
    // Ignore fallback persistence errors.
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

/**
 * @returns {Promise<{
 *   categories: Category[] | null,
 *   appointments: Appointment[] | null,
 *   preferences: PreferencesMap | null,
 *   pax: PaxMap
 * }>}
 */
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
  let dexieFailed = false

  try {
    const timeoutMs =
      typeof window !== 'undefined' &&
      typeof window.__APP_STORAGE_TIMEOUT_MS__ === 'number'
        ? window.__APP_STORAGE_TIMEOUT_MS__
        : 1500
    const [categories, appointments, preferences, pax] = await withTimeout(
      Promise.all([
        getAllCategories(),
        getAllAppointments(),
        getAllPreferences(),
        getAllPaxState(),
      ]),
      timeoutMs,
    )
    rawCategories = Array.isArray(categories) && categories.length ? categories : null
    rawAppointments = Array.isArray(appointments) ? appointments : null
    rawPreferences =
      preferences && Object.keys(preferences).length ? preferences : null
    rawPax = pax && Object.keys(pax).length ? pax : null
  } catch {
    dexieFailed = true
  }

  const noCategories = !rawCategories || rawCategories.length === 0
  const noAppointments = !rawAppointments || rawAppointments.length === 0
  if (dexieFailed || (noCategories && noAppointments)) {
    const fallback = loadFallback()
    if (fallback) {
      rawCategories = fallback.categories ?? null
      rawAppointments = fallback.appointments ?? null
      rawPreferences = fallback.preferences ?? null
      rawPax = fallback.pax ?? null
    } else if (dexieFailed) {
      return empty
    }
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

  if (!dexieFailed) {
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
  }

  const paxNormalized = normalizePaxState(rawPax ?? DEFAULT_PAX_STATE)
  if (!dexieFailed && rawPax && paxNormalized.changed) {
    await clearPax()
    await setPaxBatch(paxNormalized.state)
  }

  return {
    categories,
    appointments,
    preferences,
    pax: paxNormalized.state,
  }
}

/**
 * @param {{
 *   categories?: Category[] | null,
 *   appointments?: Appointment[] | null,
 *   preferences?: PreferencesMap | null,
 *   pax?: PaxMap | null
 * }} params
 * @returns {Promise<void>}
 */
export async function saveStoredData({
  categories,
  appointments,
  preferences,
  pax,
}) {
  try {
    await runWriteTransaction(async () => {
      await Promise.all([
        db.appointments.clear(),
        db.categories.clear(),
        db.preferences.clear(),
        db.pax.clear(),
      ])

      if (Array.isArray(categories) && categories.length > 0) {
        await db.categories.bulkPut(categories)
      }
      if (Array.isArray(appointments) && appointments.length > 0) {
        await db.appointments.bulkPut(appointments)
      }
      if (preferences && typeof preferences === 'object') {
        const records = toKeyValueRecords(preferences)
        if (records.length > 0) {
          await db.preferences.bulkPut(records)
        }
      }
      if (pax && typeof pax === 'object') {
        const records = toKeyValueRecords(pax)
        if (records.length > 0) {
          await db.pax.bulkPut(records)
        }
      }
    })
  } finally {
    saveFallback({ categories, appointments, preferences, pax })
  }
}

/**
 * @returns {Promise<string>}
 */
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
      schemaVersion: 1,
      categories,
      appointments,
      preferences: normalizedPreferences,
      pax: normalizedPax.state,
    },
    null,
    2,
  )
}

export async function checkStorageStatus() {
  try {
    await db.open()
    await db.table(STORE_NAMES.preferences).put({
      key: '__storage_test__',
      value: 1,
    })
    await db.table(STORE_NAMES.preferences).delete('__storage_test__')
    return { status: 'ok' }
  } catch {
    return { status: 'limited' }
  }
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

/**
 * @param {string} text
 * @returns {{
 *   categories: Category[],
 *   appointments: Appointment[],
 *   preferences: PreferencesMap,
 *   pax: PaxMap
 * } | null}
 */
export function parseImport(text) {
  const parsed = safeParse(text)
  if (!parsed || typeof parsed !== 'object') return null
  if ('schemaVersion' in parsed && parsed.schemaVersion !== 1) return null
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

/**
 * @param {Record<string, any> | null} currentState
 * @param {string} text
 * @returns {Promise<Record<string, any> | null>}
 */
export async function applyImport(currentState, text) {
  const parsed = parseImport(text)
  if (!parsed) return currentState
  await runWriteTransaction(async () => {
    await Promise.all([
      db.appointments.clear(),
      db.categories.clear(),
      db.preferences.clear(),
      db.pax.clear(),
    ])
    if (parsed.categories.length > 0) {
      await db.categories.bulkPut(parsed.categories)
    }
    if (parsed.appointments.length > 0) {
      await db.appointments.bulkPut(parsed.appointments)
    }
    const preferenceRecords = toKeyValueRecords(parsed.preferences)
    if (preferenceRecords.length > 0) {
      await db.preferences.bulkPut(preferenceRecords)
    }
    const paxRecords = toKeyValueRecords(parsed.pax ?? DEFAULT_PAX_STATE)
    if (paxRecords.length > 0) {
      await db.pax.bulkPut(paxRecords)
    }
  })
  if (!currentState) return parsed
  return {
    ...currentState,
    categories: parsed.categories,
    appointments: parsed.appointments,
    preferences: parsed.preferences,
    pax: parsed.pax ?? currentState.pax,
  }
}
