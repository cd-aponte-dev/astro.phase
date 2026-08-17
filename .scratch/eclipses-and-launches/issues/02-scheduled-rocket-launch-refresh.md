# 02 — Scheduled rocket launch data refresh

**What to build:** Keep an upcoming-launches snapshot fresh automatically via a scheduled GitHub Action, with no live third-party call from a visitor's browser at runtime — same pattern as the existing ISS TLE refresh.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] A GitHub Actions workflow runs on a schedule (cron), mirroring `refresh-iss-tle.yml`'s structure
- [ ] It fetches upcoming launches from the Launch Library 2 API (thespacedevs.com), all providers/agencies, far enough ahead to cover the calendar's window
- [ ] It commits the fetched data as a snapshot file (e.g. `src/data/rocket-launches.json`) when it has changed
- [ ] The snapshot includes, per launch: mission/rocket name, agency/provider name and type (government/commercial), launch site, scheduled date/time, and a flag for whether the date is confirmed to day-level precision vs. a rough estimate — in a format ticket 03 can consume
- [ ] A manual trigger (`workflow_dispatch`) exists alongside the schedule, for on-demand refresh
- [ ] No client-side code in the app calls Launch Library 2 directly at runtime
