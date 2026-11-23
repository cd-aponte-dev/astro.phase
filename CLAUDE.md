# astro.phase

A client-only React + Vite app: tonight's sky and a 90-day events calendar for a searched place. It's published to GitHub Pages under `base: '/astro.phase/'`. `README.md` describes it for portfolio visitors. Update the README in the same change whenever a feature visible to users is added, removed or renamed.

## Architecture rules

- **Compute, don't fetch.** Astronomy is computed in the browser with `astronomy-engine` and `satellite.js`. The only runtime network call is the LocationIQ place search. Any other external data comes from a script in `scripts/`, run by `.github/workflows/refresh-data.yml`, which writes a snapshot to `src/data/*.json`. The app imports that snapshot at build time. A new external source follows the same pattern, with the script's retry and staleness handling modelled on `fetch-iss-tle.mjs`.
- **Snapshots are owned by the bot.** The refresh workflow commits `src/data/*.json` to `main` every 6 hours and then redeploys. Leave those files to the workflow. Run `git pull --rebase` before pushing, because `main` moves on its own.
- **Show every time in the searched place's timezone.** Get the zone from `timeZoneForLocation`, then format with `src/format.ts` and bucket days with `dayKeyInTimeZone`. Pass `timeZone: 'UTC'` when formatting a stored `YYYY-MM-DD` key (see `formatDayKeyLabel`). The browser's own timezone is never the right one.

## Domain modules

Each event source is a module of pure functions, for example `solarEclipses.ts`. The pattern is `computeUpcomingX(observer | location, from: Date, days)`, returning plain objects. Location-dependent results carry `visible: boolean` and `reason: string | null`, where `reason` is a plain-language explanation. Every module has a matching `*.test.ts`, which pins a fixed `from` date and real coordinates and asserts exact computed values.

`calendarEvents.ts` turns all of the modules into one `CalendarEvent` list. To add a new calendar event type:

1. Add it to `CalendarEventType`.
2. Add it to `EVENT_TYPE_META`. Validate its colour against the existing set with the `dataviz` skill's palette checker, on the dark surface `#1f2028`. Only three hues clear the all-pairs check, so after three types, distinguish new types by shape (`circle`, `diamond`, `ring`, `triangle`).
3. Add it to `computeCalendarEvents`.

The legend and filters build themselves from `EVENT_TYPE_META`.

## Conventions

- Code comments explain *why* a decision was made: the constraint, the API quirk, the alternative that was rejected.
- Plan features as tickets in `.scratch/<feature>/issues/NN-<slug>.md`, each with a "What to build" line, "Blocked by", "Status" and an acceptance-criteria checklist.
- Before calling work done, check that `npm test`, `npm run lint` and `npm run build` all pass. The build includes `tsc -b`.
