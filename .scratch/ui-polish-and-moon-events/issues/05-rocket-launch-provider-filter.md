# 05 — Rocket-launch provider filter nested under the legend

**What to build:** Let the user narrow which rocket-launch providers appear in the calendar, via a sub-panel nested under the "Rocket launch" legend entry.

**Blocked by:** 04 — Event-type filter via clickable legend

**Status:** ready-for-agent

- [ ] Expanding/clicking the "Rocket launch" legend entry reveals the distinct providers present in the current `rocket-launches.json` snapshot (currently 17), each independently toggleable
- [ ] All providers are shown/active by default (opt-out model)
- [ ] Deselecting a provider hides only that provider's launches from the calendar; it does not affect the other 5 event types or the type-level toggle from ticket 04
- [ ] Provider filter state is session-only, same as the type filter
- [ ] The provider list is derived from the actual snapshot data, not hardcoded, so it stays correct as providers come and go between refreshes
