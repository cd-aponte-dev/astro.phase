import {
  twoline2satrec,
  propagate,
  gstime,
  eciToEcf,
  ecfToLookAngles,
  sunPos,
  jday,
  shadowFraction,
  degreesToRadians,
  radiansToDegrees,
  type SatRec,
  type GeodeticLocation,
} from 'satellite.js'
import { Observer } from 'astronomy-engine'
import { sunAltitudeDegrees } from './astronomy'
import type { Location } from './location'

export interface TleSnapshot {
  name: string
  line1: string
  line2: string
  fetchedAt: string
}

export interface IssPass {
  rise: Date
  maxElevation: Date
  maxElevationDegrees: number
  set: Date
  visible: boolean
  /** Plain-language reason the pass isn't visible; null when `visible` is true. */
  reason: string | null
}

const SEARCH_DAYS = 5
const STEP_SECONDS = 15

// Civil twilight: the standard threshold for "dark enough to plausibly spot
// the ISS" used by satellite-tracking sites like Heavens-Above.
const OBSERVER_DARKNESS_SUN_ALTITUDE_DEGREES = -6

// satellite.js's shadowFraction: 0 = fully lit, 1 = full umbra. The ISS's
// shadow crossings are sharp (negligible penumbra at its altitude), so
// "not fully eclipsed" is an accurate stand-in for "sunlit".
const FULL_SHADOW_FRACTION = 1

function toGeodetic(location: Location): GeodeticLocation {
  return {
    latitude: degreesToRadians(location.latitude),
    longitude: degreesToRadians(location.longitude),
    height: 0,
  }
}

function elevationDegreesAt(
  satrec: SatRec,
  observerGeodetic: GeodeticLocation,
  date: Date,
): number | null {
  const positionAndVelocity = propagate(satrec, date)
  if (!positionAndVelocity || !positionAndVelocity.position) return null

  const gmst = gstime(date)
  const positionEcf = eciToEcf(positionAndVelocity.position, gmst)
  const lookAngles = ecfToLookAngles(observerGeodetic, positionEcf)
  return radiansToDegrees(lookAngles.elevation)
}

function visibilityAt(
  satrec: SatRec,
  observer: Observer,
  date: Date,
): { visible: boolean; reason: string | null } {
  const positionAndVelocity = propagate(satrec, date)
  if (!positionAndVelocity || !positionAndVelocity.position) {
    return { visible: false, reason: 'position unavailable' }
  }

  // sunPos() is used (rather than astronomy-engine's) so the Sun vector is in
  // the same ECI/TEME frame and units (AU) that shadowFraction expects,
  // matching the satellite position propagate() just produced.
  const { rsun } = sunPos(jday(date))
  const shadow = shadowFraction(rsun, positionAndVelocity.position)
  const issSunlit = shadow < FULL_SHADOW_FRACTION

  const observerInDarkness = sunAltitudeDegrees(observer, date) < OBSERVER_DARKNESS_SUN_ALTITUDE_DEGREES

  if (!issSunlit) {
    return { visible: false, reason: "in Earth's shadow" }
  }
  if (!observerInDarkness) {
    return { visible: false, reason: 'happens in daylight' }
  }
  return { visible: true, reason: null }
}

/**
 * All geometric ISS passes (rise above horizon to set below it) over the
 * next `days` days for the given location, each marked visible or not.
 */
export function computeUpcomingIssPasses(
  tle: TleSnapshot,
  location: Location,
  from: Date,
  days: number = SEARCH_DAYS,
): IssPass[] {
  const satrec = twoline2satrec(tle.line1, tle.line2)
  const observer = new Observer(location.latitude, location.longitude, 0)
  const observerGeodetic = toGeodetic(location)

  const endTime = new Date(from.getTime() + days * 86_400_000)
  const passes: IssPass[] = []

  let current: { rise: Date; maxElevation: Date; maxElevationDegrees: number } | null = null
  let previousElevation: number | null = null

  for (
    let time = new Date(from);
    time <= endTime;
    time = new Date(time.getTime() + STEP_SECONDS * 1000)
  ) {
    const elevation = elevationDegreesAt(satrec, observerGeodetic, time)
    if (elevation === null) {
      previousElevation = null
      continue
    }

    if (current) {
      if (elevation > current.maxElevationDegrees) {
        current.maxElevation = time
        current.maxElevationDegrees = elevation
      }
      if (elevation <= 0) {
        const { visible, reason } = visibilityAt(satrec, observer, current.maxElevation)
        passes.push({ ...current, set: time, visible, reason })
        current = null
      }
    } else if (previousElevation !== null && previousElevation <= 0 && elevation > 0) {
      // A pass already under way when the search starts has an unknown true
      // rise time, so it's skipped in favor of the next full pass.
      current = { rise: time, maxElevation: time, maxElevationDegrees: elevation }
    }

    previousElevation = elevation
  }

  return passes
}
