# 03 — Tests for the calculation layer

**What to build:** A handful of tests locking down the app's pure calculation logic, so future changes to the astronomy/timezone/geocoding/pass-prediction code can be made with confidence.

**Blocked by:** 02 — Compute & display upcoming ISS passes

**Status:** ready-for-agent

- [x] A test runner is added to the project (none exists yet — Vitest is the natural fit alongside Vite), wired into `npm run test` or similar
- [x] Tests cover the existing pure functions in `astronomy.ts`, `timezone.ts`, and `geocoding.ts` against known-correct values
- [x] Tests cover the new pass-prediction and visibility-determination logic from ticket 02
- [x] Deliberately small and targeted — not an attempt at full coverage
