# 01 — Upcoming supermoons section

**What to build:** A new "Upcoming events" section, separate from the ISS-passes section, showing full moons in the next 90 days that qualify as supermoons — flagged using the standard perigee-closeness convention. Establishes the shared event-card shape that tickets 02 and 03 extend.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [x] Full moons over the next 90 days are found via `SearchMoonQuarter`/`NextMoonQuarter` (quarter === 2)
- [x] A full moon is flagged as a supermoon when its geocentric distance falls within the closest 10% of that lunar month's apogee-to-perigee range (`distance <= perigee + 0.1 * (apogee - perigee)`) — the standard NASA/timeanddate/EarthSky convention, matching the ~3-4/year rate of thumb
- [x] Nearest perigee/apogee are found via `SearchLunarApsis`/`NextLunarApsis`, searched with margin around the 90-day window so full moons near the edges still match correctly
- [x] A new "Upcoming events" section renders on the existing page, distinct from the ISS-passes section
- [x] Events render via a shared, reusable event-card shape (date/time, title, description, optional visible/not-visible + reason) that tickets 02 and 03 reuse without a rewrite
- [x] Includes a test for the supermoon threshold calculation, covering both a qualifying and a non-qualifying full moon
