export interface RocketLaunchSnapshotEntry {
  id: string
  name: string
  provider: string
  providerType: string
  site: string
  net: string
  /** True when `net` is confirmed to at least day-level precision; false for month/quarter/year estimates. */
  dayPrecision: boolean
}

export interface RocketLaunchSnapshot {
  fetchedAt: string
  launches: RocketLaunchSnapshotEntry[]
}

export interface RocketLaunch {
  id: string
  name: string
  provider: string
  site: string
  date: Date
}

const WINDOW_DAYS = 90

/**
 * Upcoming rocket launches over the next `days` days, read from a snapshot
 * fetched ahead of time (Launch Library 2 data, refreshed by a scheduled
 * GitHub Action — see `scripts/fetch-rocket-launches.mjs`). Launches whose
 * date isn't confirmed to day-level precision (month/quarter/year estimates)
 * are excluded: the calendar's day-cell model needs a specific day.
 */
export function computeUpcomingRocketLaunches(
  snapshot: RocketLaunchSnapshot,
  from: Date,
  days: number = WINDOW_DAYS,
): RocketLaunch[] {
  const end = new Date(from.getTime() + days * 86_400_000)

  return snapshot.launches
    .filter((launch) => launch.dayPrecision)
    .map((launch) => ({
      id: launch.id,
      name: launch.name,
      provider: launch.provider,
      site: launch.site,
      date: new Date(launch.net),
    }))
    .filter((launch) => launch.date >= from && launch.date <= end)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}
