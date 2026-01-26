import { db } from './dexieDb'

export const STORE_NAMES = {
  appointments: 'appointments',
  categories: 'categories',
  preferences: 'preferences',
  pax: 'pax',
}

export function reqToPromise(request) {
  if (!request) return Promise.resolve(request)
  if (typeof request.then === 'function') return request
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function openDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'))
  }
  await db.open()
  return db
}

export async function withTx(storeNames, mode, fn) {
  await openDb()
  const dexieMode = mode === 'readwrite' ? 'rw' : 'r'
  const tables = storeNames.map((name) => db.table(name))
  return db.transaction(dexieMode, tables, () =>
    fn({
      objectStore: (name) => {
        const table = db.table(name)
        return {
          clear: () => table.clear(),
          put: (value) => table.put(value),
          get: (key) => table.get(key),
          getAll: () => table.toArray(),
          delete: (key) => table.delete(key),
        }
      },
    }),
  )
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
    .then((records) =>
      records.reduce((acc, record) => {
        acc[record.key] = record.value
        return acc
      }, {}),
    )
}

export function setPreferencesBatch(values) {
  const records = Object.entries(values).map(([key, value]) => ({ key, value }))
  return db.table(STORE_NAMES.preferences).bulkPut(records)
}

export function clearPreferences() {
  return db.table(STORE_NAMES.preferences).clear()
}

export function setPaxState(key, value) {
  return db.table(STORE_NAMES.pax).put({ key, value })
}

export function setPaxBatch(values) {
  const records = Object.entries(values).map(([key, value]) => ({ key, value }))
  return db.table(STORE_NAMES.pax).bulkPut(records)
}

export function getPaxState(key) {
  return db
    .table(STORE_NAMES.pax)
    .get(key)
    .then((record) => (record ? record.value : null))
}

export function getAllPaxState() {
  return db
    .table(STORE_NAMES.pax)
    .toArray()
    .then((records) =>
      records.reduce((acc, record) => {
        acc[record.key] = record.value
        return acc
      }, {}),
    )
}

export function clearPax() {
  return db.table(STORE_NAMES.pax).clear()
}
