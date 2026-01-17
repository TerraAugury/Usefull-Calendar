import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/<REPO_NAME>/', // Replace with your GitHub repo name for Pages.
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
    include: ['src/test/**/*.{test,spec}.{js,jsx}'],
    exclude: ['tests/e2e/**'],
  },
})
