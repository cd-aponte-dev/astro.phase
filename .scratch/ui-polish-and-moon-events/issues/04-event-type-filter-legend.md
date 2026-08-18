# 04 — Event-type filter via clickable legend

**What to build:** Turn the Events Calendar legend into the event-type filter — each entry becomes a clickable, button-styled element that toggles that type's visibility in the calendar grid and day panel.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Each legend entry renders as a rounded box holding the dot/shape and label, styled clearly as a clickable button (not just static text)
- [ ] Clicking a legend entry toggles that event type on/off; toggled-off types are hidden from both the month grid dots and the day detail panel
- [ ] Toggled-off entries have a distinct visual state (e.g. dimmed) so it's clear at a glance which types are active
- [ ] Filter state lives in component state only — resets on reload/new session, no `localStorage`
- [ ] The filter list is built generically off the existing event-type metadata (not hardcoded), so a future new event type automatically gets a filter entry
- [ ] All types are shown/active by default
