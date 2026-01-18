# Appointment Notebook

React + Vite single-page app for managing appointments with a custom UI and local persistence.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm test` - unit + component tests (Vitest)
- `npm run test:e2e` - Playwright E2E tests
- `npm run test:all` - unit + component then E2E
- `npm run test:visual` - visual snapshot tests (Playwright)
- `npm run generate:airports` - refresh the generated airport mapping

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

## Airport dataset generation

Generate the static airport mapping used for timezone and country lookups:

```bash
npm run generate:airports
```

Commit the updated `src/data/airports.generated.js` after running the script.
