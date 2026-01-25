const DB_NAME = 'CalendarDB'
const DB_VERSION = 1

export const STORE_NAMES = {
  appointments: 'appointments',
  categories: 'categories',
  preferences: 'preferences',
  pax: 'pax',
}

const APPOINTMENT_INDEXES = [
  { name: 'startUtcMs', keyPath: 'startUtcMs' },
  { name: 'date', keyPath: 'date' },
  { name: 'categoryId', keyPath: 'categoryId' },
]

export function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function ensureAppointmentIndexes(store) {
  APPOINTMENT_INDEXES.forEach(({ name, keyPath }) => {
    if (!store.indexNames.contains(name)) {
      store.createIndex(name, keyPath, { unique: false })
    }
  })
}

export function openDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      const tx = request.transaction

      if (!db.objectStoreNames.contains(STORE_NAMES.appointments)) {
        const store = db.createObjectStore(STORE_NAMES.appointments, {
          keyPath: 'id',
        })
        ensureAppointmentIndexes(store)
      } else if (tx) {
        const store = tx.objectStore(STORE_NAMES.appointments)
        ensureAppointmentIndexes(store)
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.categories)) {
        db.createObjectStore(STORE_NAMES.categories, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.preferences)) {
        db.createObjectStore(STORE_NAMES.preferences, { keyPath: 'key' })
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.pax)) {
        db.createObjectStore(STORE_NAMES.pax, { keyPath: 'key' })
      }
    }

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function withTx(storeNames, mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, mode)
    let result

    const finish = (handler) => {
      db.close()
      handler()
    }

    tx.oncomplete = () => finish(() => resolve(result))
    tx.onerror = () => finish(() => reject(tx.error))
    tx.onabort = () =>
      finish(() => reject(tx.error || new Error('Transaction aborted')))

    try {
      result = fn(tx)
    } catch (error) {
      tx.abort()
      reject(error)
    }
  })
}

export function upsertAppointment(appointment) {
  return withTx([STORE_NAMES.appointments], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.appointments).put(appointment)),
  )
}

export function upsertAppointmentsBatch(appointments) {
  return withTx([STORE_NAMES.appointments], 'readwrite', (tx) => {
    const store = tx.objectStore(STORE_NAMES.appointments)
    const writes = appointments.map((appointment) =>
      reqToPromise(store.put(appointment)),
    )
    return Promise.all(writes)
  })
}

export function getAppointment(id) {
  return withTx([STORE_NAMES.appointments], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.appointments).get(id)),
  )
}

export function deleteAppointment(id) {
  return withTx([STORE_NAMES.appointments], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.appointments).delete(id)),
  )
}

export function clearAppointments() {
  return withTx([STORE_NAMES.appointments], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.appointments).clear()),
  )
}

export function getAppointmentsByStartUtcMsRange(minMs, maxMs) {
  const range = IDBKeyRange.bound(minMs, maxMs)
  return withTx([STORE_NAMES.appointments], 'readonly', (tx) => {
    const index = tx
      .objectStore(STORE_NAMES.appointments)
      .index('startUtcMs')
    return reqToPromise(index.getAll(range))
  })
}

export function getAllAppointments() {
  return withTx([STORE_NAMES.appointments], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.appointments).getAll()),
  )
}

export function upsertCategory(category) {
  return withTx([STORE_NAMES.categories], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.categories).put(category)),
  )
}

export function upsertCategoriesBatch(categories) {
  return withTx([STORE_NAMES.categories], 'readwrite', (tx) => {
    const store = tx.objectStore(STORE_NAMES.categories)
    const writes = categories.map((category) =>
      reqToPromise(store.put(category)),
    )
    return Promise.all(writes)
  })
}

export function getCategory(id) {
  return withTx([STORE_NAMES.categories], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.categories).get(id)),
  )
}

export function getAllCategories() {
  return withTx([STORE_NAMES.categories], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.categories).getAll()),
  )
}

export function deleteCategory(id) {
  return withTx([STORE_NAMES.categories], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.categories).delete(id)),
  )
}

export function clearCategories() {
  return withTx([STORE_NAMES.categories], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.categories).clear()),
  )
}

export function setPreference(key, value) {
  return withTx([STORE_NAMES.preferences], 'readwrite', (tx) =>
    reqToPromise(
      tx.objectStore(STORE_NAMES.preferences).put({ key, value }),
    ),
  )
}

export function getPreference(key) {
  return withTx([STORE_NAMES.preferences], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.preferences).get(key)),
  ).then((record) => (record ? record.value : null))
}

export function getAllPreferences() {
  return withTx([STORE_NAMES.preferences], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.preferences).getAll()),
  ).then((records) =>
    records.reduce((acc, record) => {
      acc[record.key] = record.value
      return acc
    }, {}),
  )
}

export function setPreferencesBatch(values) {
  return withTx([STORE_NAMES.preferences], 'readwrite', (tx) => {
    const store = tx.objectStore(STORE_NAMES.preferences)
    const writes = Object.entries(values).map(([key, value]) =>
      reqToPromise(store.put({ key, value })),
    )
    return Promise.all(writes)
  })
}

export function clearPreferences() {
  return withTx([STORE_NAMES.preferences], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.preferences).clear()),
  )
}

export function setPaxState(key, value) {
  return withTx([STORE_NAMES.pax], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.pax).put({ key, value })),
  )
}

export function setPaxBatch(values) {
  return withTx([STORE_NAMES.pax], 'readwrite', (tx) => {
    const store = tx.objectStore(STORE_NAMES.pax)
    const writes = Object.entries(values).map(([key, value]) =>
      reqToPromise(store.put({ key, value })),
    )
    return Promise.all(writes)
  })
}

export function getPaxState(key) {
  return withTx([STORE_NAMES.pax], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.pax).get(key)),
  ).then((record) => (record ? record.value : null))
}

export function getAllPaxState() {
  return withTx([STORE_NAMES.pax], 'readonly', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.pax).getAll()),
  ).then((records) =>
    records.reduce((acc, record) => {
      acc[record.key] = record.value
      return acc
    }, {}),
  )
}

export function clearPax() {
  return withTx([STORE_NAMES.pax], 'readwrite', (tx) =>
    reqToPromise(tx.objectStore(STORE_NAMES.pax).clear()),
  )
}
