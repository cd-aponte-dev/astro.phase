# 07 — Precision-drawn visuals for the Moon phase and 5 planets

**What to build:** A small SVG/CSS-drawn disc next to each of the 6 celestial body cards on the Sky Tonight tab, computed from data the app already has.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] One shared visual component renders a disc for any of the 6 bodies, applied consistently rather than styled differently per body
- [ ] The Moon's disc is shaded to reflect its exact current illumination percentage and waxing/waning direction (already computed as `moonIlluminationPercent`/`moonPhaseName`)
- [ ] Each of the 5 planets renders as a simple colored disc in its real approximate hue (Mercury grey, Venus pale gold, Mars rust, Jupiter tan, Saturn pale yellow)
- [ ] No new external image/icon assets — drawn via SVG or CSS, consistent with the rest of the app's compute-don't-fetch approach
- [ ] Renders correctly for a planet that isn't up tonight, same as one that is
