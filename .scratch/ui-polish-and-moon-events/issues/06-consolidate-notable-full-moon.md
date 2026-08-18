# 06 — Consolidate supermoon, blue moon, and harvest moon into one event type

**What to build:** Replace the standalone `supermoon` calendar event type with a broader `notable-full-moon` type that also covers blue moons and harvest moons, so each qualifying full moon gets exactly one calendar entry labeled with whichever facts apply.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Every full moon in the window is evaluated for three independent facts: supermoon (existing perigee-threshold logic, unchanged), blue moon (the second full moon within the same calendar month), harvest moon (the full moon nearest the Northern Hemisphere autumnal equinox, applied globally regardless of the searched location's hemisphere)
- [ ] A full moon becomes a `notable-full-moon` calendar entry only if at least one of the three facts applies; a full moon with none of them is not shown (matches the calendar's existing "only show what's worth noting" pattern)
- [ ] The entry's title/description reflects whichever facts apply, e.g. "Supermoon," "Blue moon," "Harvest moon," or a combination like "Supermoon · Blue moon"
- [ ] The standalone `supermoon` `CalendarEventType` and its dedicated dot/legend entry are removed in favor of the new `notable-full-moon` type and dot
- [ ] Existing supermoon tests are updated to the new shape (not left duplicated alongside new tests) and cover at least one case each for blue moon and harvest moon
