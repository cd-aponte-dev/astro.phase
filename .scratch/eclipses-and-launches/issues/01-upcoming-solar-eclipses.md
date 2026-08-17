# 01 — Upcoming solar eclipses in the calendar

**What to build:** Extend the Events Calendar with solar eclipses over the next 90 days, each marked visible or not for the searched location, shown as their own dot type with a legend entry.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Solar eclipses over the next 90 days are found via `SearchLocalSolarEclipse`/`NextLocalSolarEclipse`, passed the searched location's `Observer` directly (unlike lunar eclipses, this API computes local circumstances itself)
- [ ] Every local eclipse found is included — no minimum-obscuration cutoff (they're rare enough not to need one)
- [ ] Visibility is determined from each event's `altitude` field (is the peak above the horizon), using the same `visible`/`reason` shape as lunar eclipses and ISS passes; when not visible, the card shows a plain-language reason
- [ ] Event description shows the eclipse kind (partial/annular/total) and obscuration
- [ ] New `CalendarEventType: 'solar-eclipse'` added to `EVENT_TYPE_META`, with a dot color/shape chosen so the 5-way categorical set (existing 4 + solar-eclipse) passes the dataviz skill's palette validator
- [ ] Legend includes the new solar eclipse entry
- [ ] Test covers the visibility-at-location check: a visible and a not-visible case for the same eclipse at different locations, mirroring the existing lunar eclipse test
