# 02 — Show every full moon, with notable facts only on the card

**What to build:** Every full moon in the calendar window appears as its own calendar entry, not just ones that qualify as a supermoon/blue moon/harvest moon. All full moons share one dot type; only the card content varies by which facts apply.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] The `notable-full-moon` calendar event type, computation function, and label are renamed to `full-moon` / "Full moon" throughout — the old name overclaims once ordinary full moons are included
- [ ] The "at least one fact must apply" filter is removed — every full moon found in the window becomes a calendar entry; the underlying supermoon/blue-moon/harvest-moon detection logic is otherwise unchanged
- [ ] The calendar dot is identical for every full moon regardless of which facts apply — no grid-level marker distinguishes a notable full moon from an ordinary one
- [ ] A full moon with no qualifying facts shows a plain "Full moon" title/description (still including its distance) on the day-panel card
- [ ] A full moon with one or more qualifying facts keeps today's fact-based title/description (e.g. "Supermoon", "Supermoon · Blue moon")
- [ ] Existing full-moon tests are updated to the new shape and add coverage for the plain (no-fact) case
