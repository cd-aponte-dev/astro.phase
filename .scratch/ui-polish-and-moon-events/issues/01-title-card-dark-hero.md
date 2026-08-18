# 01 — Site title card with dark hero treatment

**What to build:** Give the header's title/tagline area the dark "outer-space" visual treatment already used on the Events Calendar tab, while the search bar, location/candidates list, and tab buttons stay in the current light theme.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] The title ("Tonight's Sky") and any tagline sit in a dark hero band reusing the space theme tokens already defined for the Events Calendar tab (`--space-bg`, `--space-text`, `--space-accent`, starfield background)
- [ ] The search form, location/candidates list, and tab buttons remain visually in the current light theme, directly below the hero band
- [ ] The hero band renders correctly before a location is searched (empty state) and after (location + window shown)
- [ ] No layout shift or overlap introduced on narrow viewports
