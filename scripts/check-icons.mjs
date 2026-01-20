import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const distDir = join(root, 'dist')
const requiredFiles = [
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'site.webmanifest',
]

const missing = requiredFiles.filter((file) => !existsSync(join(distDir, file)))
if (missing.length) {
  console.error('Missing icon assets in dist:')
  for (const file of missing) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

console.log('Icon assets present in dist/icons:')
for (const file of readdirSync(join(distDir, 'icons'))) {
  console.log(`- ${file}`)
}
