import {
  Body,
  Observer,
  SearchRiseSet,
  SearchHourAngle,
  Equator,
  Horizon,
  Illumination,
  MoonPhase,
} from 'astronomy-engine'

export interface NightWindow {
  start: Date
  end: Date
}

export type BodyKey = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'

export interface SkyObject {
  body: BodyKey
  /** null when the object is already above the horizon at nightfall (no rise event tonight) */
  rise: Date | null
  /** null when the object stays up past dawn (no set event tonight) */
  set: Date | null
  /** planets only; null for Sun/Moon or when culmination falls outside the window */
  transit: Date | null
  isUpTonight: boolean
  /** Moon only */
  moonPhaseName?: string
  /** Moon only, 0-100 */
  moonIlluminationPercent?: number
}

const PLANET_BODIES: BodyKey[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

/**
 * "Tonight" is the current night if it's already dark, or the upcoming night if it's
 * still daytime — found by comparing whichever of the next sunrise/sunset comes first.
 */
export function computeTonightWindow(observer: Observer, now: Date): NightWindow {
  const nextSunrise = SearchRiseSet(Body.Sun, observer, +1, now, 2)
  const nextSunset = SearchRiseSet(Body.Sun, observer, -1, now, 2)
  if (!nextSunrise || !nextSunset) {
    throw new Error('Could not find a sunrise/sunset for this location (too close to a pole?).')
  }

  const currentlyNight = nextSunrise.date < nextSunset.date
  if (currentlyNight) {
    const priorSunset = SearchRiseSet(Body.Sun, observer, -1, now, -2)
    return { start: priorSunset ? priorSunset.date : now, end: nextSunrise.date }
  }

  const followingSunrise = SearchRiseSet(Body.Sun, observer, +1, nextSunset.date, 2)
  if (!followingSunrise) {
    throw new Error('Could not find a sunrise/sunset for this location (too close to a pole?).')
  }
  return { start: nextSunset.date, end: followingSunrise.date }
}

function altitudeAt(body: Body, observer: Observer, date: Date): number {
  const equ = Equator(body, date, observer, true, true)
  const hor = Horizon(date, observer, equ.ra, equ.dec, 'normal')
  return hor.altitude
}

/** Sun's altitude in degrees above the observer's horizon at the given moment. */
export function sunAltitudeDegrees(observer: Observer, date: Date): number {
  return altitudeAt(Body.Sun, observer, date)
}

/** Moon's altitude in degrees above the observer's horizon at the given moment. */
export function moonAltitudeDegrees(observer: Observer, date: Date): number {
  return altitudeAt(Body.Moon, observer, date)
}

function moonPhaseName(eclipticLongitude: number): string {
  const lon = ((eclipticLongitude % 360) + 360) % 360
  if (lon < 1 || lon > 359) return 'New Moon'
  if (Math.abs(lon - 90) < 1) return 'First Quarter'
  if (Math.abs(lon - 180) < 1) return 'Full Moon'
  if (Math.abs(lon - 270) < 1) return 'Last Quarter'
  if (lon < 90) return 'Waxing Crescent'
  if (lon < 180) return 'Waxing Gibbous'
  if (lon < 270) return 'Waning Gibbous'
  return 'Waning Crescent'
}

function computeRiseSetTransit(
  bodyEnum: Body,
  observer: Observer,
  window: NightWindow,
): Pick<SkyObject, 'rise' | 'set' | 'transit' | 'isUpTonight'> {
  const durationDays = (window.end.getTime() - window.start.getTime()) / 86_400_000
  const searchLimitDays = durationDays + 0.5

  const riseEvent = SearchRiseSet(bodyEnum, observer, +1, window.start, searchLimitDays)
  const setEvent = SearchRiseSet(bodyEnum, observer, -1, window.start, searchLimitDays)
  const alreadyUpAtStart = altitudeAt(bodyEnum, observer, window.start) > 0

  const rise = riseEvent && riseEvent.date <= window.end ? riseEvent.date : null
  const set = setEvent && setEvent.date <= window.end ? setEvent.date : null

  let transit: Date | null = null
  if (PLANET_BODIES.includes(bodyEnum as BodyKey)) {
    const transitEvent = SearchHourAngle(bodyEnum, observer, 0, window.start, +1)
    if (transitEvent.time.date >= window.start && transitEvent.time.date <= window.end) {
      transit = transitEvent.time.date
    }
  }

  const isUpTonight = alreadyUpAtStart || rise !== null

  return { rise, set, transit, isUpTonight }
}

export function computeTonightsSky(observer: Observer, window: NightWindow): SkyObject[] {
  const bodies: { key: BodyKey; enum: Body }[] = [
    { key: 'Sun', enum: Body.Sun },
    { key: 'Moon', enum: Body.Moon },
    { key: 'Mercury', enum: Body.Mercury },
    { key: 'Venus', enum: Body.Venus },
    { key: 'Mars', enum: Body.Mars },
    { key: 'Jupiter', enum: Body.Jupiter },
    { key: 'Saturn', enum: Body.Saturn },
  ]

  return bodies.map(({ key, enum: bodyEnum }) => {
    const { rise, set, transit, isUpTonight } = computeRiseSetTransit(bodyEnum, observer, window)

    const skyObject: SkyObject = { body: key, rise, set, transit, isUpTonight }

    if (key === 'Moon') {
      skyObject.moonPhaseName = moonPhaseName(MoonPhase(window.start))
      skyObject.moonIlluminationPercent = Illumination(Body.Moon, window.start).phase_fraction * 100
    }

    return skyObject
  })
}

export { Observer }
