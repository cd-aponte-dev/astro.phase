import { Observer, SearchLocalSolarEclipse, NextLocalSolarEclipse, EclipseKind } from 'astronomy-engine'

export interface SolarEclipse {
  peak: Date
  kind: EclipseKind
  /** Fraction of the Sun's disc obscured at peak, 0-1. */
  obscuration: number
  visible: boolean
  /** Plain-language reason the eclipse isn't visible; null when `visible` is true. */
  reason: string | null
}

const WINDOW_DAYS = 90

/**
 * Solar eclipses over the next `days` days for the given observer.
 * Unlike `SearchLunarEclipse`, `SearchLocalSolarEclipse` computes local
 * circumstances directly for the observer's location (a solar eclipse is
 * only geometrically visible from part of the Earth), so each observer's
 * search can turn up different peak times for what's otherwise the same
 * eclipse. Visibility here is still a separate check on top of that: is the
 * Sun above the horizon at this location at peak.
 */
export function computeUpcomingSolarEclipses(
  observer: Observer,
  from: Date,
  days: number = WINDOW_DAYS,
): SolarEclipse[] {
  const end = new Date(from.getTime() + days * 86_400_000)
  const eclipses: SolarEclipse[] = []

  let eclipse = SearchLocalSolarEclipse(from, observer)
  while (eclipse.peak.time.date <= end) {
    const peak = eclipse.peak.time.date
    const visible = eclipse.peak.altitude > 0

    eclipses.push({
      peak,
      kind: eclipse.kind,
      obscuration: eclipse.obscuration,
      visible,
      reason: visible ? null : 'Sun below the horizon at this location',
    })

    eclipse = NextLocalSolarEclipse(eclipse.peak.time, observer)
  }

  return eclipses
}
