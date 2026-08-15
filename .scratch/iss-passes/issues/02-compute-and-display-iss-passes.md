# 02 — Compute & display upcoming ISS passes

**What to build:** For whatever location the user has searched, show every ISS pass expected over the next 5 days, times in that location's local time, each pass clearly marked visible or not — with a plain-language reason when it's not.

**Blocked by:** 01 — Scheduled TLE refresh

**Status:** ready-for-agent

- [x] Passes are computed via `satellite.js` SGP4 propagation against the TLE snapshot committed by ticket 01
- [x] All geometric passes (ISS above the horizon) in the next 5 days are included — none silently filtered out
- [x] Each pass shows rise, max-elevation, and set times, localized to the searched place's timezone (reuse the existing `@photostructure/tz-lookup` + `Intl.DateTimeFormat` path)
- [x] Each pass is marked visible or not, based on: ISS sunlit (`shadowFraction` from `satellite.js`, using `sunPos()` or an `astronomy-engine` sun-position vector — confirm frame/units match, AU vs km) AND observer in darkness (sun altitude via `astronomy-engine`)
- [x] When a pass is not visible, show a plain-language reason (e.g. "in Earth's shadow" or "happens in daylight")
- [x] Passes appear in a new, distinct section on the existing page, below the current nightly display
- [x] The section is its own component, not entangled with the existing nightly-display component — leaves room for a future "sky calendar" (upcoming events for everything, not just ISS) without a rewrite
