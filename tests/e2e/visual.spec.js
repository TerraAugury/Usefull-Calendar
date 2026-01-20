import { test, expect } from '@playwright/test'
import { buildSeedData, disableAnimations, initApp } from './helpers.js'

async function waitForAppReady(page, theme) {
  await page.waitForFunction(
    (targetTheme) => {
      const root = document.documentElement
      const main = document.querySelector('main')
      return (
        root.getAttribute('data-theme') === targetTheme &&
        main?.getAttribute('data-hydrated') === 'true'
      )
    },
    theme,
  )
}

async function setVisualTestMode(page, height) {
  await page.evaluate((vh) => {
    document.documentElement.setAttribute('data-visual-test', '1')
    document.documentElement.style.setProperty('--visual-vh', `${vh}px`)
  }, height)
}

test.describe('visual mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  test('visual: calendar light (mobile) @visual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'light' })
    const seedData = buildSeedData({ theme: 'light' })
    await initApp(page, { seedData })
    await setVisualTestMode(page, 844)
    await waitForAppReady(page, 'light')
    const calendarRoot = page.getByTestId('calendar-root')
    await expect(calendarRoot).toBeVisible()
    await disableAnimations(page)
    await expect(calendarRoot).toHaveScreenshot('calendar-light-mobile.png')
  })

  test('visual: filter drawer open @visual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'light' })
    const seedData = buildSeedData({ theme: 'light' })
    await initApp(page, { seedData })
    await setVisualTestMode(page, 844)
    await waitForAppReady(page, 'light')
    await page.getByLabel('More options').click()
    const drawer = page.locator('.drawer-content[data-state="open"]')
    await drawer.waitFor({ state: 'visible' })
    await drawer.evaluate((node) => node.scrollTo(0, 0))
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        }),
    )
    await disableAnimations(page)
    await expect(drawer).toHaveScreenshot('filter-drawer-open.png', {
      maxDiffPixelRatio: 0.01,
    })
  })

  test('visual: appointment details dialog open @visual', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'light' })
    const seedData = buildSeedData({ theme: 'light' })
    await initApp(page, { seedData })
    await setVisualTestMode(page, 844)
    await waitForAppReady(page, 'light')
    await page.locator('[data-appointment-id="apt_sample_08"]').click()
    const sheet = page.locator('.sheet-content')
    await sheet.waitFor({ state: 'visible' })
    await sheet.evaluate((node) => node.scrollTo(0, 0))
    await disableAnimations(page)
    await expect(sheet).toHaveScreenshot('details-dialog-open.png')
  })
})

test.describe('visual desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })

  test('visual: calendar dark (desktop) @visual', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.emulateMedia({ colorScheme: 'dark' })
    const seedData = buildSeedData({ theme: 'dark' })
    await initApp(page, { seedData })
    await setVisualTestMode(page, 720)
    await waitForAppReady(page, 'dark')
    const calendarRoot = page.getByTestId('calendar-root')
    await expect(calendarRoot).toBeVisible()
    await disableAnimations(page)
    await expect(calendarRoot).toHaveScreenshot('calendar-dark-desktop.png')
  })
})
