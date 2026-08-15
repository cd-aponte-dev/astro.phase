import { Observer, SearchLunarEclipse, NextLunarEclipse, EclipseKind } from 'astronomy-engine'
import { moonAltitudeDegrees } from './astronomy'

export interface LunarEclipse {
  peak: Date
  kind: EclipseKind
  visible: boolean
  /** Plain-language reason the eclipse isn't visible; null when `visible` is true. */
  reason: string | null
}

const WINDOW_DAYS = 90

/**
 * Lunar eclipses over the next `days` days, each marked visible or not for
 * the given observer. `SearchLunarEclipse` has no observer parameter (an
 * eclipse is visible from the whole night hemisphere), so visibility here is
 * a separate check: is the Moon above the horizon at this location at peak.
 */
export function computeUpcomingLunarEclipses(
  observer: Observer,
  from: Date,
  days: number = WINDOW_DAYS,
): LunarEclipse[] {
  const end = new Date(from.getTime() + days * 86_400_000)
  const eclipses: LunarEclipse[] = []

  let eclipse = SearchLunarEclipse(from)
  while (eclipse.peak.date <= end) {
    const peak = eclipse.peak.date
    const visible = moonAltitudeDegrees(observer, peak) > 0

    eclipses.push({
      peak,
      kind: eclipse.kind,
      visible,
      reason: visible ? null : 'Moon below the horizon at this location',
    })

    eclipse = NextLunarEclipse(eclipse.peak)
  }

  return eclipses
}
