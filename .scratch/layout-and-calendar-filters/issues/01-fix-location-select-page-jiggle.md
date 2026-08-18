# 01 — Fix page layout shift when a location is selected

**What to build:** Selecting a location (or getting search results back) no longer shifts the page horizontally.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `html` reserves scrollbar-gutter space (e.g. `scrollbar-gutter: stable`) so the vertical scrollbar appearing/disappearing as page height changes never shifts the centered `.page` content left or right
- [ ] Verified end-to-end: searching and selecting a location that grows the page past viewport height causes no visible horizontal shift of the header, search form, or tabs
- [ ] No layout shift on any other height-changing interaction already in the app (switching tabs, expanding the rocket-launch provider list, opening a day panel)
