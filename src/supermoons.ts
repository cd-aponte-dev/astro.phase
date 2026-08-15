import {
  Body,
  Illumination,
  SearchMoonQuarter,
  NextMoonQuarter,
  SearchLunarApsis,
  NextLunarApsis,
  ApsisKind,
  KM_PER_AU,
  type Apsis,
} from 'astronomy-engine'

export interface Supermoon {
  date: Date
  distanceKm: number
  perigeeDistanceKm: number
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

function nearest(apsides: Apsis[], date: Date): Apsis {
  return apsides.reduce((closest, candidate) =>
    Math.abs(candidate.time.date.getTime() - date.getTime()) <
    Math.abs(closest.time.date.getTime() - date.getTime())
      ? candidate
      : closest,
  )
}

/**
 * Full moons in the next `days` days whose distance places them within the
 * supermoon threshold of that lunar month's perigee.
 */
export function computeUpcomingSupermoons(from: Date, days: number = WINDOW_DAYS): Supermoon[] {
  const end = new Date(from.getTime() + days * 86_400_000)
  const apsides = collectApsides(from, end)
  const perigees = apsides.filter((apsis) => apsis.kind === ApsisKind.Pericenter)
  const apogees = apsides.filter((apsis) => apsis.kind === ApsisKind.Apocenter)

  const supermoons: Supermoon[] = []

  let quarter = SearchMoonQuarter(from)
  while (quarter.time.date <= end) {
    if (quarter.quarter === FULL_MOON_QUARTER) {
      const date = quarter.time.date
      const distanceKm = Illumination(Body.Moon, date).geo_dist * KM_PER_AU
      const perigeeDistanceKm = nearest(perigees, date).dist_km
      const apogeeDistanceKm = nearest(apogees, date).dist_km
      const threshold =
        perigeeDistanceKm + SUPERMOON_RANGE_FRACTION * (apogeeDistanceKm - perigeeDistanceKm)

      if (distanceKm <= threshold) {
        supermoons.push({ date, distanceKm, perigeeDistanceKm })
      }
    }
    quarter = NextMoonQuarter(quarter)
  }

  return supermoons
}
