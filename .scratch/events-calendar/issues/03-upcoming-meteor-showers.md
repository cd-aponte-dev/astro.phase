# 03 — Upcoming meteor showers

**What to build:** Extend the "Upcoming events" section with major meteor showers peaking in the next 90 days.

**Blocked by:** 01 — Upcoming supermoons section

**Status:** ready-for-agent

- [x] A small static dataset of the 8 IMO major showers (Quadrantids, Lyrids, eta Aquariids, Southern delta Aquariids, Perseids, Orionids, Leonids, Geminids) is bundled into the repo: name, peak month/day, ZHR
- [x] Showers whose peak falls in the next 90 days are shown as event cards (name, peak date, ZHR) — no exact peak time is claimed, since the curated dataset is only day-precision
- [x] No moon-brightness/light-pollution modeling — consistent with the rest of the app's pure-geometry visibility decisions; showers have no visible/not-visible flag
- [x] Rendered using the shared event-card shape from ticket 01, merged chronologically with supermoon and lunar-eclipse events
- [x] Includes a test for the "which showers peak in this window" filter, including a case spanning a year boundary
