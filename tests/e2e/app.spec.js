import { test, expect } from '@playwright/test'
import { buildSeedData, initApp } from './helpers.js'

test('smoke: load sample data and edit an appointment', async ({ page }) => {
  await initApp(page)

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: /load sample data/i }).click()
  const confirmDialog = page.getByRole('dialog', { name: /load sample data/i })
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: /load sample data/i }).click()
  await expect(confirmDialog).not.toBeVisible()

  await page.getByRole('button', { name: 'Calendar' }).click()
  const card = page.locator('[data-appointment-id="apt_sample_08"]')
  await expect(card).toBeVisible()
  await card.click()

  const detailsDialog = page.getByRole('dialog', { name: /evening walk/i })
  await expect(detailsDialog).toBeVisible()
  await detailsDialog.getByRole('button', { name: 'Edit' }).click()

  const editDialog = page.getByRole('dialog', { name: /edit appointment/i })
  await expect(editDialog).toBeVisible()
  await editDialog.getByLabel('Title').fill('Updated project sync')
  await editDialog.getByRole('button', { name: /save changes/i }).click()

  const updatedDetails = page.getByRole('dialog', { name: /updated project sync/i })
  await expect(updatedDetails).toBeVisible()
  await updatedDetails.getByLabel('Close details').click()
  await expect(updatedDetails).not.toBeVisible()

  await expect(page.getByText('Updated project sync')).toBeVisible()
})

test('add flow: new appointment returns to calendar and appears upcoming', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })

  await page.getByRole('button', { name: 'Add appointment' }).click()
  await page.getByLabel('Title').fill('Vendor call')
  await page.getByLabel('Date').fill('2026-01-10')
  await page.getByLabel('Start time').fill('13:00')
  await page.getByLabel('End time').fill('13:30')

  await page.getByRole('button', { name: /save appointment/i }).click()
  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()

  const firstCard = page.locator('.appointment-card').first()
  await expect(firstCard).toContainText('Vendor call')
})

test('no-past enforcement blocks saving', async ({ page }) => {
  await initApp(page)

  await page.getByRole('button', { name: 'Add appointment' }).click()
  await page.getByLabel('Title').fill('Past check')
  await page.getByLabel('Date').fill('2026-01-09')
  await page.getByLabel('Start time').fill('09:00')

  const saveButton = page.getByRole('button', { name: /save appointment/i })
  await expect(saveButton).toBeDisabled()
  await expect(page.getByText(/appointments cannot be in the past/i)).toBeVisible()
})

test('date and time inputs enforce min values', async ({ page }) => {
  await initApp(page)

  await page.getByRole('button', { name: 'Add appointment' }).click()
  const dateInput = page.getByLabel('Date')
  await expect(dateInput).toHaveAttribute('min', '2026-01-10')

  await dateInput.fill('2026-01-10')
  const timeInput = page.getByLabel('Start time')
  await expect(timeInput).toHaveAttribute('min', '10:00')
})

test('calendar grid opens day sheet with appointments', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })

  const switcher = page.locator('.calendar-view-switcher')
  await switcher.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.locator('.calendar-grid')).toBeVisible()

  await page.locator('[data-date="2026-01-10"]').click()
  await expect(page.getByText('Evening walk')).toBeVisible()
})

test('timezone mode: create appointment with Europe/Paris', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Time handling').selectOption('timezone')

  await page.getByRole('button', { name: 'Add appointment' }).click()
  await page.getByLabel('Title').fill('Paris briefing')
  await page.getByLabel('Date').fill('2026-01-10')
  await page.getByLabel('Timezone').selectOption('Europe/Paris')
  await page.getByLabel('Start time').fill('12:00')

  await page.getByRole('button', { name: /save appointment/i }).click()
  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()

  const firstCard = page.locator('.appointment-card').first()
  await expect(firstCard).toContainText('Paris briefing')
  await expect(firstCard).toContainText('Europe/Paris')
})
