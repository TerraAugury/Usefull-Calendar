# Appointment Notebook

React + Vite single-page app for managing appointments with a custom UI and local persistence.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm test` - unit + component tests (Vitest)
- `npm run test:e2e` - Playwright E2E tests
- `npm run test:all` - unit + component then E2E
- `npm run test:visual` - visual snapshot tests (Playwright)

## Playwright setup

Install browsers once:

```bash
npx playwright install --with-deps
```

## Visual snapshots

Update snapshots when intentional UI changes are made:

```bash
npm run test:visual -- --update-snapshots
```
