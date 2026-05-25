---
name: project-moneymind
description: Core architecture, conventions and formatting rules for the MoneyMind Nuxt 3 personal finance app
metadata:
  type: project
---

MoneyMind is a Nuxt 3 / Vue 3 personal finance application using PrimeVue as the UI component library.

**Stack:**
- Nuxt 3 + Vue 3 (Composition API with `<script setup>`)
- PrimeVue (DataTable, DataView, Card, Dialog, InputNumber, Skeleton, Toast, ConfirmDialog, etc.)
- PrimeFlex for utility CSS classes
- Font Awesome icons (`fa-solid`, `fa-regular`, etc.)
- `moment.js` for date formatting
- No Tailwind config found — utility classes come from PrimeFlex

**Project structure:**
- `/pages/` — all routes: `home.vue`, `conti.vue`, `budget.vue`, `obiettivi.vue`, `entrate-fisse.vue`, `entrate.vue`, `uscite.vue`, `entrate-mesi/[id].vue`, `uscite-mesi/[id].vue`
- `/utils/` — auto-imported pure utilities (created during this session)
- `/layouts/` — `sidebar` layout used by all pages via `<NuxtLayout name="sidebar">`
- `/server/` — API routes
- No `/components/` directory exists

**Monetary formatting rule:**
All euro/monetary values displayed as plain text must use `formatEuro(value)` from `/utils/formatEuro.ts`.
This utility does `Number(value ?? 0).toFixed(2) + ' €'`, e.g. `12330.4` → `"12330.40 €"`.
It is Nuxt 3 auto-imported — no import statement needed in pages.

**Do NOT touch:**
PrimeVue `<InputNumber mode="currency" currency="EUR" locale="it-IT">` components — they handle their own formatting internally.

**DataTable columns** (e.g. `<Column field="soldi">`) that bind raw numbers do not currently display a euro sign — they show plain numbers. These were not in scope for the formatting fix.

**Why:**
API values are plain JS numbers (e.g. `12330.4`). The `formatEuro` helper was introduced to ensure consistent 2-decimal euro display without touching InputNumber components. See [[feedback-euro-formatting]].
