# 02 — Upcoming lunar eclipses

**What to build:** Extend the "Upcoming events" section with lunar eclipses over the next 90 days, each marked visible or not for the searched location.

**Blocked by:** 01 — Upcoming supermoons section

**Status:** ready-for-agent

- [x] Eclipses over the next 90 days are found via `SearchLunarEclipse`/`NextLunarEclipse`
- [x] Each event card shows the eclipse type (penumbral/partial/total)
- [x] Visibility is determined separately from `SearchLunarEclipse` itself (which has no observer parameter): the Moon must be above the horizon at the searched location at the eclipse's peak time
- [x] When not visible, the card shows a plain-language reason (Moon below the horizon at this location)
- [x] Rendered using the shared event-card shape from ticket 01, merged chronologically with supermoon events
- [x] Includes a test for the visibility-at-location check, covering both a visible and a not-visible case for the same eclipse at different locations
