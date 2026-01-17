# VisualSpec.md

This spec defines the app’s look and feel (spacing, type, surfaces, light/dark, and key components). Implement via CSS variables + custom CSS. No UI libraries.

---

## 1) Design goals
- iOS-inspired: clean, spacious, subtle elevation
- Highly readable, touch-friendly (mobile-first)
- Color is used as an accent (category stripe/dot + gentle tint), not heavy blocks

---

## 2) Layout & grid

### Breakpoints
- Mobile base: 360–430px
- Desktop/tablet: ≥ 900px
  - Center content with max-width and comfortable margins

### Screen padding & spacing
Use a consistent spacing scale:

- `--space-1: 4px`
- `--space-2: 8px`
- `--space-3: 12px`
- `--space-4: 16px`
- `--space-5: 24px`
- `--space-6: 32px`

Guidelines:
- Screen horizontal padding: **16px**
- Card vertical gap: **10–12px**
- Card padding: **12–14px**
- Tap target minimum height: **44px**

### Structure
- `header` (sticky): title + actions (burger icon on Calendar)
- `main`: content
- `nav` (bottom tabs): fixed on mobile

---

## 3) Typography

Font stack:
- `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif`

Type scale (recommended):
- Screen title: **20px**, weight 600
- Section label: **13px**, weight 600
- Body: **15–16px**
- Secondary/meta: **12–13px**
- Button text: **15px**, weight 600

Line heights:
- Headings: 1.2–1.3
- Body: 1.4–1.5

---

## 4) Radius, borders, shadows

Radii:
- Cards: **14px**
- Inputs/buttons: **12px**
- Pills/chips: **999px**
- Sheet/modal corners: **16–20px**

Borders:
- Hairline: `1px solid var(--border)`

Shadows (subtle):
- Light: `0 6px 18px rgba(0,0,0,0.06)`
- Dark: `0 8px 24px rgba(0,0,0,0.35)` (use sparingly)

---

## 5) Color system (Light + Dark)

All colors must be CSS variables.

### Core UI tokens
Define these in `:root`:
- `--bg`
- `--surface`
- `--surface-2`
- `--text`
- `--text-2`
- `--border`
- `--focus`
- `--tint-alpha` (category tint strength)

#### Recommended values
**Light (default)**
- `--bg: #F2F2F7;`
- `--surface: #FFFFFF;`
- `--surface-2: #F7F7FA;`
- `--text: #111111;`
- `--text-2: #5C5C66;`
- `--border: rgba(0,0,0,0.10);`
- `--focus: rgba(10,132,255,0.45);`
- `--tint-alpha: 0.16;`

**Dark** (`@media (prefers-color-scheme: dark)`)
- `--bg: #000000;`
- `--surface: #1C1C1E;`
- `--surface-2: #2C2C2E;`
- `--text: #F2F2F7;`
- `--text-2: rgba(242,242,247,0.72);`
- `--border: rgba(255,255,255,0.12);`
- `--focus: rgba(10,132,255,0.55);`
- `--tint-alpha: 0.22;`

### Category palette tokens
Define these in `:root`:
- `--c-blue:   #0A84FF;`
- `--c-green:  #30D158;`
- `--c-orange: #FF9F0A;`
- `--c-red:    #FF453A;`
- `--c-purple: #BF5AF2;`
- `--c-teal:   #64D2FF;`
- `--c-indigo: #5E5CE6;`
- `--c-pink:   #FF375F;`
- `--c-yellow: #FFD60A;`
- `--c-gray:   #8E8E93;`

---

## 6) Components

### 6.1 Bottom tab bar (mobile)
- Fixed bottom, full width
- Height: **64px** + safe area inset
- Background: `--surface`
- Border-top: `1px solid var(--border)`
- Each tab item:
  - Icon + label (label 11–12px)
  - Active: tint with `--c-blue` (or a dedicated `--brand` if you add one)
- Safe area:
  - include `padding-bottom: env(safe-area-inset-bottom)`

The “+” tab:
- Slightly emphasized (e.g., filled circle behind icon) but subtle and consistent.

### 6.2 Header
- Sticky at top
- Background: `--bg` (or `--surface` if you prefer)
- Title left
- Actions right (burger icon)
- Bottom divider: `1px solid var(--border)` optional

### 6.3 Buttons
- Height: **44px**
- Radius: **12px**
- Primary:
  - Background: `--c-blue`
  - Text: white
- Secondary:
  - Background: `--surface-2`
  - Border: `--border`
- Destructive:
  - Red text/outline; confirm step before destructive action

### 6.4 Inputs
- Height: **44px**
- Radius: **12px**
- Background: `--surface-2`
- Border: `1px solid var(--border)`
- Focus ring:
  - `outline: 3px solid var(--focus); outline-offset: 2px;`

### 6.5 Appointment card (category colored)
- Card base: `--surface`, border `--border`, radius 14px
- Uses per-card CSS custom property:
  - `--accent: var(--c-<color>)`
- Must show:
  1) Left accent stripe (recommended)
     - Width: **4px**
     - Rounded ends
     - Color: `var(--accent)`
  2) Subtle tint background derived from `--accent`
     - Prefer:
       - `background: color-mix(in srgb, var(--accent) calc(var(--tint-alpha) * 100%), transparent);`
     - Provide fallback if `color-mix` unsupported:
       - Use `--surface` background and keep stripe/dot so color still shows
  3) Category pill (dot + label)
     - Pill background: light tint of `--accent`
     - Dot: 8px circle using `--accent`

Text layout:
- Title (one line, ellipsis)
- Secondary row: time + location (muted `--text-2`)
- Status indicator can be subtle (text or small badge)

### 6.6 Burger filter drawer
- Trigger: burger icon button in Calendar header
- Drawer:
  - Mobile: slide-in from right OR bottom sheet
  - Desktop: side panel or modal is fine
- Contains:
  - Search
  - Category dropdown
  - Date range
  - Sort
  - Reset/Clear
- Show “filters active” indicator on burger icon when filters != defaults (small dot/badge)

### 6.7 Details sheet / modal
- Use Radix Dialog behavior, custom CSS styling
- Mobile:
  - Bottom sheet style with rounded top corners
- Desktop:
  - Centered modal is fine
- Overlay:
  - semi-transparent black
- Close:
  - X button + Esc support
- Contents:
  - All appointment fields
  - Actions: Edit, Delete (confirm), Status control

---

## 7) Motion (optional)
- Keep subtle:
  - 150–220ms transitions for sheet/drawer open/close
- Prefer CSS transitions; avoid heavy animations

---

## 8) States & feedback
- Empty state: friendly message + CTA (e.g., “Add your first appointment”)
- Validation: inline error text under fields (small, red)
- Toast: optional (position above bottom tabs)

---

## 9) Icon style
- Simple line icons (SVG), consistent stroke width
- Sizes:
  - Tab icons: 22–24px
  - Header icons: 18–20px

---

## 10) Visual “Done” checklist
- Looks correct in light and dark
- High contrast text on surfaces
- Touch targets ≥ 44px
- Bottom nav never covers content (content has bottom padding)
- Category color usage is subtle and consistent (no loud blocks)
- Cards, inputs, buttons share consistent radii and spacing
- Desktop content has max width (~900–1100px) and doesn’t look stretched
