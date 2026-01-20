process.env.TZ = 'Europe/Paris'

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      name: 'e2e',
      grepInvert: /@visual/,
    },
    {
      name: 'visual',
      grep: /@visual/,
      snapshotPathTemplate:
        '{testDir}/visual.spec.js-snapshots/{arg}-linux{ext}',
      use: {
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    timezoneId: 'Europe/Paris',
    locale: 'en-GB',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run dev -- --host --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
