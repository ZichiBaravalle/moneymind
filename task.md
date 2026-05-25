# task.md

## TASK

### 1 — Optimize all async calls with Promise.all

Scan every composable, page, and component in the project that performs multiple async operations (useFetch, useAsyncData, $fetch, or raw async/await calls).

For every place where two or more independent async calls are executed sequentially (one after the other with await), refactor them to run in parallel using Promise.all or Promise.allSettled.

Rules for this step:
- Use `Promise.all` when all calls must succeed together (fail fast is acceptable).
- Use `Promise.allSettled` when calls are independent and a partial result is still useful to the user.
- Never parallelize calls that have a data dependency (where call B needs the result of call A as input) — leave those sequential.
- Wrap every Promise.all / Promise.allSettled in a try/catch if not already inside one.
- In Nuxt 3 context: prefer parallelizing inside useAsyncData or useFetch's handler rather than creating multiple top-level watchers.

---

### 2 — Improve data management

For every piece of async data fetched in the project:

- Ensure the data is correctly typed end-to-end (no `any`, no untyped ref).
- Add a `transform` option on useFetch/useAsyncData calls where raw API data needs reshaping before use — do not transform data inside the template or in watchers.
- Add a `getCachedData` strategy where the same data is fetched multiple times across navigations without needing a fresh network call each time.
- Where lists of items are fetched, ensure empty array `[]` is the default value (not `null` or `undefined`) so templates never need to guard against undefined before iterating.
- Where single objects are fetched, define a typed null state and handle it explicitly in the component.

---

### 3 — Error handling — Code level

For every async operation in the project (composables, server/api routes, pages):

- Every `useFetch` and `useAsyncData` call must explicitly handle the `error` ref returned by the composable. Do not silently ignore it.
- Every raw `$fetch` or `async/await` block must be wrapped in try/catch with typed error handling.
- In `/server/api` routes: every handler must be wrapped in try/catch and return a proper H3 error using `createError({ statusCode, statusMessage })` — never let unhandled exceptions propagate.
- Distinguish between error types where possible:
  - Network / timeout errors → suggest retry
  - 401 / 403 → redirect to login or show permission message
  - 404 → show not found state
  - 422 / 400 → show validation message
  - 500 → show generic server error with error ID if available
- Log errors to the console in development only (`if (import.meta.dev)`). Never log in production.

---

### 4 — Error handling — UI / Graphic level

For every page and component that fetches data, implement three explicit visual states:

**Loading state:**
- Show a skeleton loader that matches the shape of the content being loaded (not a generic spinner in the middle of the page).
- Disable interactive elements (buttons, inputs) during loading.
- The skeleton must be visible immediately on first render — use `pending` from useFetch/useAsyncData.

**Error state:**
- Show a dedicated error UI block (not just a console.log or a red text line).
- The error block must contain: a clear human-readable message, the type of error if distinguishable (network, permission, not found, server), and a retry button that re-triggers the fetch.
- Error messages must never expose raw API error strings or stack traces to the user.
- Style error states with a visually distinct but non-alarming treatment (avoid full red backgrounds — use subtle error color tokens).

**Empty state:**
- When data loads successfully but the result is an empty list or null object, show a meaningful empty state: an icon or illustration, a short message explaining why it's empty, and a contextual action if applicable (e.g. "Create your first item").
- Empty state must be clearly different from the loading state.

---

## ⛔ ABSOLUTE CONSTRAINT

**DO NOT touch the database layer under any circumstances.**
This means: do not modify any database schema, migration files, ORM models, query builders, raw SQL, Prisma/Drizzle/Kysely config, or any file inside a `/db`, `/database`, `/migrations`, or `/models` directory.
If a fix logically requires a database change to be done properly, stop, document the limitation in a comment, and implement the best possible solution at the application layer without touching the database.