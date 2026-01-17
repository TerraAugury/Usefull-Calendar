import { test, expect } from '@playwright/test'
import { buildSeedData, disableAnimations, initApp } from './helpers.js'

test('visual: calendar light (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const seedData = buildSeedData({ theme: 'light' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'light',
  )
  await disableAnimations(page)
  await expect(page).toHaveScreenshot('calendar-light-mobile.png', { fullPage: true })
})

test('visual: calendar dark (desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const seedData = buildSeedData({ theme: 'dark' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'dark',
  )
  await disableAnimations(page)
  await expect(page).toHaveScreenshot('calendar-dark-desktop.png', { fullPage: true })
})

test('visual: filter drawer open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const seedData = buildSeedData({ theme: 'light' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'light',
  )
  await page.getByLabel('Open filters').click()
  await page.waitForSelector('.drawer-content')
  await disableAnimations(page)
  await expect(page).toHaveScreenshot('filter-drawer-open.png', { fullPage: true })
})

test('visual: appointment details dialog open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const seedData = buildSeedData({ theme: 'light' })
  await initApp(page, { seedData })
  await page.waitForFunction(
    () => document.documentElement.getAttribute('data-theme') === 'light',
  )
  await page.locator('[data-appointment-id="apt_sample_08"]').click()
  await page.waitForSelector('.sheet-content')
  await disableAnimations(page)
  await expect(page).toHaveScreenshot('details-dialog-open.png', { fullPage: true })
})
