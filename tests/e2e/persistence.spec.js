import { test, expect } from '@playwright/test'
import fs from 'fs/promises'
import { Buffer } from 'buffer'
import { buildSeedData, initApp } from './helpers.js'

const tripPayload = [
  {
    name: 'Demo Trip',
    records: [
      {
        paxNames: ['Alex Smith'],
        pnr: 'ABC123',
        flightDate: '2026-01-12',
        route: {
          flightNumber: 'BA0664',
          airline: 'British Airways',
          departure: {
            iata: 'LHR',
            scheduled: '2026-01-12T09:00:00+00:00',
          },
          arrival: {
            iata: 'LCA',
            scheduled: '2026-01-12T15:00:00+02:00',
          },
        },
      },
    ],
    hotels: [],
  },
]

test('persistence: sample data survives reload', async ({ page }) => {
  await initApp(page)

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: /load sample data/i }).click()
  const confirmDialog = page.getByRole('dialog', { name: /load sample data/i })
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: /load sample data/i }).click()
  await expect(confirmDialog).not.toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
  await expect(page.locator('.appointment-card').first()).toBeVisible()
})

test('persistence: trip import pax selection survives reload', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })

  await page.getByRole('button', { name: 'Settings' }).click()
  const fileInput = page.getByLabel('Import Trip JSON')
  await fileInput.setInputFiles({
    name: 'trip.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(tripPayload), 'utf8'),
  })

  const paxDialog = page.getByRole('dialog', { name: /select passenger/i })
  await expect(paxDialog).toBeVisible()
  await paxDialog.getByRole('button', { name: 'Alex Smith' }).click()

  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
  await page.getByLabel('More options').click()
  const drawer = page.getByRole('dialog', { name: 'Filters' })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByLabel('Passenger')).toHaveValue('Alex Smith')
  await page.keyboard.press('Escape')

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
  await page.getByLabel('More options').click()
  const drawerAfterReload = page.getByRole('dialog', { name: 'Filters' })
  await expect(drawerAfterReload).toBeVisible()
  await expect(drawerAfterReload.getByLabel('Passenger')).toHaveValue('Alex Smith')
})

test('persistence: add waits for hydration and survives reload', async ({ page }) => {
  await page.addInitScript(() => {
    window.__APP_HYDRATION_DELAY_MS__ = 2000
  })
  await initApp(page)

  await expect(page.getByText('Loading appointments...')).toBeVisible()
  const addTab = page.getByRole('button', { name: 'Add appointment' })
  await expect(addTab).toBeDisabled()

  await page.waitForFunction(() => window.__APP_READY__ === true)
  await expect(addTab).toBeEnabled()

  await addTab.click()
  const timeZoneSelect = page.locator('select#timeZone')
  if ((await timeZoneSelect.count()) > 0) {
    await timeZoneSelect.selectOption('Europe/London')
  }
  await page.getByLabel('Title').fill('Hydration hold')
  await page.getByLabel('Date').fill('2026-01-10')
  await page.getByLabel('Start time').fill('12:00')
  await page.getByLabel('End time').fill('12:30')

  const saveButton = page.getByRole('button', { name: /save appointment/i })
  await expect(saveButton).toBeEnabled()
  await saveButton.click()
  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
  await expect(page.getByText('Hydration hold')).toBeVisible()

  await page.reload()
  await page.waitForFunction(() => window.__APP_READY__ === true)
  await expect(page.getByText('Hydration hold')).toBeVisible()
})

test('persistence: export and re-import restores data', async ({ page }) => {
  const seedData = buildSeedData()
  await initApp(page, { seedData })

  await page.getByRole('button', { name: 'Categories' }).click()
  await page.getByLabel('Name').fill('Pilates')
  await page.getByRole('button', { name: 'Add category' }).click()
  await expect(page.getByText('Pilates')).toBeVisible()
  await page.waitForTimeout(200)

  await page.getByRole('button', { name: 'Settings' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /export json/i }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()
  expect(downloadPath).toBeTruthy()
  const buffer = await fs.readFile(downloadPath)

  await page.getByRole('button', { name: /reset all data/i }).click()
  const resetDialog = page.getByRole('dialog', { name: /reset everything/i })
  await expect(resetDialog).toBeVisible()
  await resetDialog.getByRole('button', { name: 'Reset' }).click()
  await expect(resetDialog).not.toBeVisible()

  await page.getByRole('button', { name: 'Settings' }).click()
  const importInput = page.locator('input#import-file')
  await importInput.setInputFiles({
    name: 'export.json',
    mimeType: 'application/json',
    buffer,
  })
  const importButton = page.locator('button', { hasText: 'Import JSON' })
  await expect(importButton).toBeEnabled()
  await importButton.click()
  const confirmDialog = page.getByRole('dialog', { name: /overwrite all data/i })
  await expect(confirmDialog).toBeVisible()
  await confirmDialog.getByRole('button', { name: 'Overwrite' }).click()
  await expect(confirmDialog).not.toBeVisible()

  await page.getByRole('button', { name: 'Calendar' }).click()
  await expect(page.getByText('Evening walk')).toBeVisible()
  await page.getByRole('button', { name: 'Categories' }).click()
  await expect(page.getByText('Pilates')).toBeVisible()
})
