# 02 — Remove redundant "Visible" mark from ISS pass entries

**What to build:** Stop showing the "Visible" status line for ISS pass entries in the calendar day panel, since every ISS entry is already pre-filtered to visible-only and the label conveys no information.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `CalendarDayPanel`'s visibility status line and `visible`/`not-visible` class no longer render for entries where `type === 'iss'`
- [ ] Lunar eclipse and solar eclipse entries keep the status line unchanged — they still have genuine visible/not-visible variance
- [ ] Existing tests/behavior for eclipse visibility display are unaffected
