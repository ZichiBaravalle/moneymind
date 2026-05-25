---
name: feedback-euro-formatting
description: How to format euro values in templates — use formatEuro(), never raw interpolation with €
metadata:
  type: feedback
---

Always use `formatEuro(value)` from `/utils/formatEuro.ts` for any plain-text euro display in templates. Never write `{{ item.soldi }}€` directly.

**Why:** Raw number interpolation drops trailing zeros — `12330.4` renders as `"12330.4€"` instead of `"12330.40 €"`. The helper enforces exactly 2 decimal places and consistent spacing before the euro sign.

**How to apply:** Any time a monetary value is interpolated in a Vue template as text (e.g. in a `<div>`, `<span>`, or similar), wrap it with `formatEuro()`. The utility is auto-imported via Nuxt 3's `/utils/` directory — no import needed. Exception: `<InputNumber mode="currency">` components handle their own formatting internally and must NOT be modified.

See [[project-moneymind]] for full project context.
