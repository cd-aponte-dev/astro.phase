# 01 — Scheduled TLE refresh

**What to build:** Keep the site's ISS orbital data (TLE) fresh automatically via a scheduled GitHub Action, with no live third-party call from a visitor's browser at runtime.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [x] A GitHub Actions workflow runs on a schedule (cron, every 6–12h)
- [x] It fetches current ISS TLE data from Celestrak (NORAD CATNR 25544 — confirmed CORS-enabled, but rate-limited to roughly one fetch per 2h update cycle, so don't over-poll)
- [x] It commits the fetched data as a snapshot file in the repo (e.g. `src/data/iss-tle.json`) when it has changed
- [x] The snapshot includes both TLE lines and a fetch timestamp, in a format ticket 02 can consume
- [x] A manual trigger (`workflow_dispatch`) exists alongside the schedule, for on-demand refresh
- [x] No client-side code in the app calls Celestrak directly at runtime
