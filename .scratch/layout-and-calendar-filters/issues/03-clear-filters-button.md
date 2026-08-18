# 03 — Add a "Clear filters" button to the Events Calendar

**What to build:** A button that resets the calendar's event-type and rocket-launch provider filters back to fully active in one click.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] A "Clear filters" button sits at the bottom-right of the calendar widget
- [ ] Clicking it resets both the event-type legend toggles and the rocket-launch provider toggles to fully active (undoes any filtering — opt-out model, so "clear" means "show everything," not "hide everything")
- [ ] The rocket-launch provider sub-panel's expanded/collapsed state is untouched by this action — it's a display convenience, not a filter
- [ ] The button is always visible and clickable, with no disabled state to track — clicking it when nothing is filtered is a harmless no-op
