import { db } from './dexieDb'

export const STORE_NAMES = {
  appointments: 'appointments',
  categories: 'categories',
  preferences: 'preferences',
  pax: 'pax',
}

export function toKeyValueRecords(obj) {
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj).map(([key, value]) => ({ key, value }))
}

export function fromKeyValueRecords(rows) {
  if (!Array.isArray(rows)) return {}
  return rows.reduce((acc, record) => {
    acc[record.key] = record.value
    return acc
  }, {})
}

export async function runWriteTransaction(fn) {
  return db.transaction('rw', db.appointments, db.categories, db.preferences, db.pax, fn)
}

export function upsertAppointment(appointment) {
  return db.table(STORE_NAMES.appointments).put(appointment)
}

export function upsertAppointmentsBatch(appointments) {
  return db.table(STORE_NAMES.appointments).bulkPut(appointments)
}

export function getAppointment(id) {
  return db.table(STORE_NAMES.appointments).get(id)
}

export function deleteAppointment(id) {
  return db.table(STORE_NAMES.appointments).delete(id)
}

export function clearAppointments() {
  return db.table(STORE_NAMES.appointments).clear()
}

export function getAppointmentsByStartUtcMsRange(minMs, maxMs) {
  return db
    .table(STORE_NAMES.appointments)
    .where('startUtcMs')
    .between(minMs, maxMs, true, true)
    .toArray()
}

export function getAllAppointments() {
  return db.table(STORE_NAMES.appointments).toArray()
}

export function upsertCategory(category) {
  return db.table(STORE_NAMES.categories).put(category)
}

export function upsertCategoriesBatch(categories) {
  return db.table(STORE_NAMES.categories).bulkPut(categories)
}

export function getCategory(id) {
  return db.table(STORE_NAMES.categories).get(id)
}

export function getAllCategories() {
  return db.table(STORE_NAMES.categories).toArray()
}

export function deleteCategory(id) {
  return db.table(STORE_NAMES.categories).delete(id)
}

export function clearCategories() {
  return db.table(STORE_NAMES.categories).clear()
}

export function setPreference(key, value) {
  return db.table(STORE_NAMES.preferences).put({ key, value })
}

export function getPreference(key) {
  return db
    .table(STORE_NAMES.preferences)
    .get(key)
    .then((record) => (record ? record.value : null))
}

export function getAllPreferences() {
  return db
    .table(STORE_NAMES.preferences)
    .toArray()
    .then((records) => fromKeyValueRecords(records))
}

export function setPreferencesBatch(values) {
  return db.table(STORE_NAMES.preferences).bulkPut(toKeyValueRecords(values))
}

export function clearPreferences() {
  return db.table(STORE_NAMES.preferences).clear()
}

export function setPaxState(key, value) {
  return db.table(STORE_NAMES.pax).put({ key, value })
}

export function setPaxBatch(values) {
  return db.table(STORE_NAMES.pax).bulkPut(toKeyValueRecords(values))
}

export function getPaxState(key) {
  return db
    .table(STORE_NAMES.pax)
    .get(key)
    .then((record) => (record ? record.value : null))
}

export function getAllPaxState() {
  return db.table(STORE_NAMES.pax).toArray().then(fromKeyValueRecords)
}

export function clearPax() {
  return db.table(STORE_NAMES.pax).clear()
}
