import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-restricted-globals': ['error', 'localStorage', 'sessionStorage'],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'localStorage',
          message: 'Use IndexedDB storage helpers instead of localStorage.',
        },
        {
          object: 'window',
          property: 'sessionStorage',
          message: 'Use IndexedDB storage helpers instead of sessionStorage.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/app_(appointments|categories|preferences)/]",
          message: 'Legacy localStorage keys are not allowed.',
        },
        {
          selector:
            "TemplateElement[value.raw=/app_(appointments|categories|preferences)/]",
          message: 'Legacy localStorage keys are not allowed.',
        },
      ],
    },
  },
  {
    files: [
      'playwright.config.js',
      'playwright.preview.config.js',
      'scripts/**/*.{js,mjs}',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
    },
  },
])
