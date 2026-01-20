import { test, expect } from '@playwright/test'
import { buildSeedData, disableAnimations, initApp } from './helpers.js'

test('visual: calendar light (mobile) @visual', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'light' })
  const seedData = buildSeedData({ theme: 'light' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'light',
  )
  await disableAnimations(page)
  await expect(page).toHaveScreenshot('calendar-light-mobile.png')
})

test('visual: calendar dark (desktop) @visual', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.emulateMedia({ colorScheme: 'dark' })
  const seedData = buildSeedData({ theme: 'dark' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'dark',
  )
  await disableAnimations(page)
  await expect(page).toHaveScreenshot('calendar-dark-desktop.png')
})

test('visual: filter drawer open @visual', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'light' })
  const seedData = buildSeedData({ theme: 'light' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'light',
  )
  await page.getByLabel('More options').click()
  const drawer = page.locator('.drawer-content[data-state="open"]')
  await drawer.waitFor({ state: 'visible' })
  await drawer.evaluate((node) => {
    node.scrollTop = 0
  })
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
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'light',
  )
  await page.locator('[data-appointment-id="apt_sample_08"]').click()
  const sheet = page.locator('.sheet-content')
  await sheet.waitFor({ state: 'visible' })
  await disableAnimations(page)
  await expect(sheet).toHaveScreenshot('details-dialog-open.png')
})
