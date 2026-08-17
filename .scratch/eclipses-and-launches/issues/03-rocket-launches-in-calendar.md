# 03 — Rocket launches in the calendar

**What to build:** Show upcoming government and commercial rocket launches in the Events Calendar as a global schedule (no location filtering), as their own dot type with a legend entry.

**Blocked by:** 01 — Upcoming solar eclipses in the calendar, 02 — Scheduled rocket launch data refresh

**Status:** ready-for-agent

- [ ] Launches are read from the `src/data/rocket-launches.json` snapshot (ticket 02) and merged into `computeCalendarEvents`
- [ ] Only launches with a confirmed/day-level date are included; TBD/month-only estimates are excluded
- [ ] No location filtering — every included launch worldwide appears on the calendar, regardless of the searched location
- [ ] All providers (government + commercial) included for now
- [ ] Event description shows mission name, agency, and launch site
- [ ] New `CalendarEventType: 'rocket-launch'` added to `EVENT_TYPE_META`, with a dot color/shape chosen so the full 6-type categorical set (including solar-eclipse from ticket 01) passes the dataviz skill's palette validator
- [ ] Legend includes the new rocket launch entry
- [ ] Test covers the confirmed-date filtering: a day-level-date launch included, a TBD one excluded
