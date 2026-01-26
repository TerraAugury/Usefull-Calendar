# Agents.md (React + Vite) — Appointment Notebook (Radix + Custom UI)

## North Star
Build a mobile-first appointment notebook as a React + Vite SPA that matches `VisualSpec.md`, persists locally, and deploys to GitHub Pages (project site).

## UI Philosophy
- No visual UI component libraries (no MUI/Chakra/Ant/etc).
- Use **Radix Primitives** for accessible headless building blocks (Dialog/Popover/DropdownMenu as needed).
- All styling is custom CSS using tokens from `VisualSpec.md`.
- Remove unused code immediately (no dead files/modules).

## Information Architecture
Bottom tabs (mobile-first):
1) **Calendar** (primary: browse + view + edit existing appointments)
2) **+** (Add only: create new appointments)
3) **Categories**
4) **Settings**

Rules:
- Calendar is the only browsing surface.
- The **+ tab is ONLY for creating** (never used for editing).
- Search + filters live in a **burger menu/drawer** on Calendar.

## Core UX Flows

### Calendar (Browse + Edit)
- Agenda grouped by date.
- Burger drawer contains:
  - Search (title/location/notes)
  - Category filter
  - Date range
  - Sort
  - Reset filters
- Tap an appointment opens **Details** (Radix Dialog styled as bottom sheet on mobile; modal ok on desktop).
- Details actions:
  - **Edit** (opens an Edit form in a Dialog/sheet within Calendar)
  - **Delete** (confirm)
  - **Status** change (planned/done/cancelled)

Edit flow must stay in Calendar:
- Edit opens a prefilled form in a Dialog/sheet.
- Save updates the appointment and returns to Details (or closes back to Calendar).
- Cancel discards changes.

### + Tab (Add Only)
- Shows a blank “Add Appointment” form.
- Preserves draft while switching tabs (draft is only for Add).
- Save:
  - creates the appointment
  - shows a toast/confirmation
  - navigates back to Calendar and makes the new item visible (best-effort)

### Categories
- Add category (name + fixed palette color)
- List categories with a color dot
- Enforce unique names (case-insensitive)

### Settings
- Export JSON (includes categories + appointments)
- Import JSON (validate + confirm overwrite; invalid does nothing)
- Reset all local data (confirm)
- Optional theme selector: System/Light/Dark

## Data Model
- Category: `{ id, name, color }`
- Appointment:
  `{ id, title, date, startTime, endTime?, categoryId, location?, notes?, status, createdAt, updatedAt }`
- Category `color` must be one of:
  `blue, green, orange, red, purple, teal, indigo, pink, yellow, gray`

## Persistence (New Repo — No v1/v2 naming)
Use simple localStorage keys (no version suffixes):
- `app_categories`
- `app_appointments`
- `app_preferences`

No migration logic required.

## Storage
- Local persistence uses Dexie (IndexedDB wrapper).
- DB name is `CalendarDB` (must not change).
- Dexie singleton lives in `src/storage/dexieDb.js`.
- Dexie-backed storage API lives in `src/storage/db.js`.
- Orchestration (load/save/import/export + fallback) is in `src/storage/storage.js`.
- Store/table names are stable: `appointments`, `categories`, `preferences`, `pax`.
- Appointment indexes used: `startUtcMs`, `date`, `categoryId` (do not remove).

### Testing note
- Unit tests reset using `db.delete()`.
- E2E tests seed IndexedDB and rely on those store names.

## Styling
- Implement `VisualSpec.md` via global CSS variables (light/dark via `prefers-color-scheme`).
- Appointment category coloring:
  - per-card `--accent` set to palette var
  - subtle tint + accent stripe/dot + category pill dot

## State & Architecture
- Single source of truth: `useReducer` + Context.
- Domain logic (validate/filter/sort/group) must be pure and tested.
- Delete unused code immediately.

## Automated Testing
- Vitest + jsdom + React Testing Library
- Minimum tests:
  - category validation (unique name, valid palette)
  - appointment validation (required fields, endTime >= startTime)
  - filter/sort logic
  - agenda grouping by date
  - import/export validation (invalid doesn’t overwrite)
  - at least one component interaction test (edit dialog submit or filter reset)

## GitHub Pages (Project Site)
- Set Vite `base` to `/<REPO_NAME>/`.
- Avoid real path routing; keep tab nav in state (hash routing only if needed later).

## Delivery Principles
- Small, working increments.
- Keep `npm run dev` + `npm run build` working.
- Match `VisualSpec.md` over adding extra features.
- No dead code.
