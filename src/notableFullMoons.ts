import {
  Body,
  Illumination,
  SearchMoonQuarter,
  NextMoonQuarter,
  SearchLunarApsis,
  NextLunarApsis,
  ApsisKind,
  Seasons,
  KM_PER_AU,
  type Apsis,
} from 'astronomy-engine'

export interface NotableFullMoon {
  date: Date
  distanceKm: number
  perigeeDistanceKm: number
  facts: {
    supermoon: boolean
    blueMoon: boolean
    harvestMoon: boolean
  }
}

const WINDOW_DAYS = 90
const FULL_MOON_QUARTER = 2

// The fraction of that lunar month's apogee-to-perigee range counted as
// "close enough to perigee" to call a supermoon — the standard
// NASA/timeanddate/EarthSky convention (full moon within the closest 10% of
// the range), giving the commonly cited ~3-4 supermoons per year.
const SUPERMOON_RANGE_FRACTION = 0.1

// Wider than the ~27.55-day anomalistic month so the nearest perigee/apogee
// to a full moon near the window's edges is still found.
const APSIS_SEARCH_MARGIN_DAYS = 20

// Wider than one synodic month (~29.53 days) so: (a) the full moon just
// before `from` is captured, needed to tell whether the window's first full
// moon is itself the second ("blue") moon of its calendar month, and (b) the
// full moons bracketing a September equinox near the window's edge are both
// captured, needed to determine which one is nearer (the harvest moon).
const FULL_MOON_SEARCH_MARGIN_DAYS = 35

// The true nearest-to-equinox full moon is always within half a synodic
// month (~14.77 days); this is generous enough to always include it (and,
// when there are two candidates straddling the equinox, both of them).
const HARVEST_CANDIDATE_WINDOW_DAYS = 20

interface FullMoonInstance {
  date: Date
  distanceKm: number
  perigeeDistanceKm: number
  apogeeDistanceKm: number
}

function collectApsides(from: Date, to: Date): Apsis[] {
  const marginMs = APSIS_SEARCH_MARGIN_DAYS * 86_400_000
  const searchEnd = new Date(to.getTime() + marginMs)
  const apsides: Apsis[] = []

  let apsis = SearchLunarApsis(new Date(from.getTime() - marginMs))
  while (apsis.time.date <= searchEnd) {
    apsides.push(apsis)
    apsis = NextLunarApsis(apsis)
  }
  return apsides
}

function nearestApsis(apsides: Apsis[], date: Date): Apsis {
  return apsides.reduce((closest, candidate) =>
    Math.abs(candidate.time.date.getTime() - date.getTime()) <
    Math.abs(closest.time.date.getTime() - date.getTime())
      ? candidate
      : closest,
  )
}

function collectFullMoons(searchFrom: Date, searchTo: Date, perigees: Apsis[], apogees: Apsis[]): FullMoonInstance[] {
  const instances: FullMoonInstance[] = []
  let quarter = SearchMoonQuarter(searchFrom)
  while (quarter.time.date <= searchTo) {
    if (quarter.quarter === FULL_MOON_QUARTER) {
      const date = quarter.time.date
      instances.push({
        date,
        distanceKm: Illumination(Body.Moon, date).geo_dist * KM_PER_AU,
        perigeeDistanceKm: nearestApsis(perigees, date).dist_km,
        apogeeDistanceKm: nearestApsis(apogees, date).dist_km,
      })
    }
    quarter = NextMoonQuarter(quarter)
  }
  return instances
}

function isSupermoon(fullMoon: FullMoonInstance): boolean {
  const threshold =
    fullMoon.perigeeDistanceKm +
    SUPERMOON_RANGE_FRACTION * (fullMoon.apogeeDistanceKm - fullMoon.perigeeDistanceKm)
  return fullMoon.distanceKm <= threshold
}

function monthBucketKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`
}

function isBlueMoon(fullMoon: FullMoonInstance, allFullMoons: FullMoonInstance[]): boolean {
  const bucket = monthBucketKey(fullMoon.date)
  return allFullMoons.some(
    (other) => monthBucketKey(other.date) === bucket && other.date.getTime() < fullMoon.date.getTime(),
  )
}

// Northern Hemisphere convention, applied globally regardless of the
// searched location's hemisphere: the full moon nearest that year's
// September equinox.
function isHarvestMoon(fullMoon: FullMoonInstance, allFullMoons: FullMoonInstance[]): boolean {
  const equinox = Seasons(fullMoon.date.getUTCFullYear()).sep_equinox.date
  const windowMs = HARVEST_CANDIDATE_WINDOW_DAYS * 86_400_000
  const candidates = allFullMoons.filter(
    (candidate) => Math.abs(candidate.date.getTime() - equinox.getTime()) <= windowMs,
  )
  if (candidates.length === 0) return false

  const nearest = candidates.reduce((closest, candidate) =>
    Math.abs(candidate.date.getTime() - equinox.getTime()) < Math.abs(closest.date.getTime() - equinox.getTime())
      ? candidate
      : closest,
  )
  return nearest.date.getTime() === fullMoon.date.getTime()
}

/**
 * Full moons in the next `days` days that qualify as at least one of:
 * supermoon (near perigee), blue moon (second full moon in its calendar
 * month), or harvest moon (nearest full moon to the Northern Hemisphere
 * autumnal equinox). A full moon with none of these facts is omitted.
 */
export function computeUpcomingNotableFullMoons(
  from: Date,
  days: number = WINDOW_DAYS,
): NotableFullMoon[] {
  const end = new Date(from.getTime() + days * 86_400_000)
  const marginMs = FULL_MOON_SEARCH_MARGIN_DAYS * 86_400_000
  const searchFrom = new Date(from.getTime() - marginMs)
  const searchTo = new Date(end.getTime() + marginMs)

  const apsides = collectApsides(searchFrom, searchTo)
  const perigees = apsides.filter((apsis) => apsis.kind === ApsisKind.Pericenter)
  const apogees = apsides.filter((apsis) => apsis.kind === ApsisKind.Apocenter)

  const fullMoons = collectFullMoons(searchFrom, searchTo, perigees, apogees)

  const notable: NotableFullMoon[] = []
  for (const fullMoon of fullMoons) {
    if (fullMoon.date < from || fullMoon.date > end) continue

    const facts = {
      supermoon: isSupermoon(fullMoon),
      blueMoon: isBlueMoon(fullMoon, fullMoons),
      harvestMoon: isHarvestMoon(fullMoon, fullMoons),
    }
    if (!facts.supermoon && !facts.blueMoon && !facts.harvestMoon) continue

    notable.push({
      date: fullMoon.date,
      distanceKm: fullMoon.distanceKm,
      perigeeDistanceKm: fullMoon.perigeeDistanceKm,
      facts,
    })
  }

  return notable
}
