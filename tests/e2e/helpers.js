import { getDefaultCategories, getSampleAppointments } from '../../src/data/sampleData.js'

export const FIXED_NOW_ISO = '2026-01-10T10:00:00.000Z'

export function buildSeedData({
  nowIso = FIXED_NOW_ISO,
  theme = 'light',
  timeMode = 'local',
  showPast = false,
} = {}) {
  const now = new Date(nowIso)
  const categories = getDefaultCategories()
  const appointments = getSampleAppointments(categories, now)
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
  await page.addInitScript(({ payload }) => {
    localStorage.setItem('app_categories', payload.categories)
    localStorage.setItem('app_appointments', payload.appointments)
    localStorage.setItem('app_preferences', payload.preferences)
  }, {
    payload: {
      categories: JSON.stringify(data.categories),
      appointments: JSON.stringify(data.appointments),
      preferences: JSON.stringify(data.preferences),
    },
  })
}

export async function clearStorage(page) {
  await page.addInitScript(() => {
    localStorage.clear()
  })
}

export async function initApp(page, { nowIso = FIXED_NOW_ISO, seedData } = {}) {
  await freezeTime(page, nowIso)
  if (seedData) {
    await seedStorage(page, seedData)
  } else {
    await clearStorage(page)
  }
  await page.goto('/')
  await page.waitForSelector('.app')
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
