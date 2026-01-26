import { getDefaultCategories, getSampleAppointments } from '../../src/data/sampleData.js'

export const FIXED_NOW_ISO = '2026-01-10T10:00:00.000Z'

export function buildSeedData({
  nowIso = FIXED_NOW_ISO,
  theme = 'light',
  timeMode = 'timezone',
  showPast = false,
} = {}) {
  const now = new Date(nowIso)
  const categories = getDefaultCategories()
  const appointments = getSampleAppointments(categories, now, { timeMode })
  const preferences = { theme, showPast, timeMode }
  return { categories, appointments, preferences }
}

export async function freezeTime(page, nowIso = FIXED_NOW_ISO) {
  const timestamp = new Date(nowIso).getTime()
  await page.addInitScript(({ timestamp }) => {
    const OriginalDate = Date
    class MockDate extends OriginalDate {
      constructor(...args) {
        if (args.length === 0) {
          super(timestamp)
        } else {
          super(...args)
        }
      }
      static now() {
        return timestamp
      }
    }
    MockDate.UTC = OriginalDate.UTC
    MockDate.parse = OriginalDate.parse
    MockDate.prototype = OriginalDate.prototype
    window.Date = MockDate
  }, { timestamp })
}

export async function seedStorage(page, data) {
  await page.evaluate(async (payload) => {
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase('CalendarDB')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
    const openDb = () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open('CalendarDB', 1)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains('appointments')) {
            const store = db.createObjectStore('appointments', { keyPath: 'id' })
            store.createIndex('startUtcMs', 'startUtcMs', { unique: false })
            store.createIndex('date', 'date', { unique: false })
            store.createIndex('categoryId', 'categoryId', { unique: false })
          }
          if (!db.objectStoreNames.contains('categories')) {
            db.createObjectStore('categories', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('preferences')) {
            db.createObjectStore('preferences', { keyPath: 'key' })
          }
          if (!db.objectStoreNames.contains('pax')) {
            db.createObjectStore('pax', { keyPath: 'key' })
          }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(
        ['appointments', 'categories', 'preferences', 'pax'],
        'readwrite',
      )
      const appointmentsStore = tx.objectStore('appointments')
      const categoriesStore = tx.objectStore('categories')
      const preferencesStore = tx.objectStore('preferences')
      const paxStore = tx.objectStore('pax')

      appointmentsStore.clear()
      categoriesStore.clear()
      preferencesStore.clear()
      paxStore.clear()

      payload.categories.forEach((category) => categoriesStore.put(category))
      payload.appointments.forEach((appointment) =>
        appointmentsStore.put(appointment),
      )
      Object.entries(payload.preferences).forEach(([key, value]) => {
        preferencesStore.put({ key, value })
      })
      Object.entries(payload.pax).forEach(([key, value]) => {
        paxStore.put({ key, value })
      })

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted'))
    })
    db.close()
  }, {
    categories: data.categories ?? [],
    appointments: data.appointments ?? [],
    preferences: data.preferences ?? {},
    pax: data.pax ?? { selectedPaxName: null, paxNames: [], paxLocations: {} },
  })
}

export async function clearStorage(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const request = indexedDB.deleteDatabase('CalendarDB')
        request.onsuccess = () => resolve()
        request.onerror = () => resolve()
        request.onblocked = () => resolve()
      }),
  )
}

export async function initApp(page, { nowIso = FIXED_NOW_ISO, seedData } = {}) {
  await freezeTime(page, nowIso)
  await page.goto('/')
  await page.waitForSelector('.app')
  if (seedData) {
    await seedStorage(page, seedData)
    await page.reload()
    await page.waitForSelector('.app')
  } else {
    await clearStorage(page)
    await page.reload()
    await page.waitForSelector('.app')
  }
}

export async function disableAnimations(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      .dialog-overlay,
      .dialog-content,
      .sheet-content,
      .drawer-content {
        box-shadow: none !important;
        filter: none !important;
        backdrop-filter: none !important;
      }
      .drawer-content {
        scrollbar-gutter: stable both-edges !important;
      }
      .drawer-content::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }
    `,
  })
}
