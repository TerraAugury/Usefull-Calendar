import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { buildSeedData, initApp } from './helpers.js'

async function expectNoSeriousViolations(page, selector) {
  const builder = new AxeBuilder({ page })
  if (selector) {
    builder.include(selector)
  }
  const results = await builder.analyze()
  const serious = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact),
  )
  expect(serious).toEqual([])
}

test('a11y: calendar screen', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })
  await expectNoSeriousViolations(page, '.app')
})

test('a11y: filter drawer', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })
  await page.getByLabel('Open filters').click()
  await page.waitForSelector('.drawer-content')
  await expectNoSeriousViolations(page, '.drawer-content')
})

test('a11y: appointment details dialog', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })
  await page.locator('[data-appointment-id="apt_sample_08"]').click()
  await page.waitForSelector('.sheet-content')
  await expectNoSeriousViolations(page, '.sheet-content')
})

test('a11y: add appointment form', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })
  await page.getByRole('button', { name: 'Add appointment' }).click()
  await page.waitForSelector('form')
  await expectNoSeriousViolations(page, 'form')
})
