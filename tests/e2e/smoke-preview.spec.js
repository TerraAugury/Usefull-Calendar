import { test, expect } from '@playwright/test'
import { initApp } from './helpers.js'

test('preview smoke: loads calendar', async ({ page }) => {
  await initApp(page)
  await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()
})
