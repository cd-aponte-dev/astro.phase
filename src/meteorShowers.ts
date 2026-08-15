export interface MeteorShower {
  name: string
  /** 1-12 */
  peakMonth: number
  peakDay: number
  zhr: number
}

export interface UpcomingMeteorShower {
  name: string
  peak: Date
  zhr: number
}

const WINDOW_DAYS = 90

// The IMO's annual working list of major showers (ZHR >~15), with typical
// peak date and zenithal hourly rate. Curated, not computed — consistent
// with every other major astronomy-events dataset, these aren't derived
// from orbital mechanics.
export const METEOR_SHOWERS: MeteorShower[] = [
  { name: 'Quadrantids', peakMonth: 1, peakDay: 4, zhr: 120 },
  { name: 'Lyrids', peakMonth: 4, peakDay: 22, zhr: 18 },
  { name: 'eta Aquariids', peakMonth: 5, peakDay: 6, zhr: 50 },
  { name: 'Southern delta Aquariids', peakMonth: 7, peakDay: 30, zhr: 25 },
  { name: 'Perseids', peakMonth: 8, peakDay: 12, zhr: 100 },
  { name: 'Orionids', peakMonth: 10, peakDay: 21, zhr: 20 },
  { name: 'Leonids', peakMonth: 11, peakDay: 17, zhr: 15 },
  { name: 'Geminids', peakMonth: 12, peakDay: 14, zhr: 150 },
]

/** Major meteor showers whose peak falls in the next `days` days, in UTC. */
export function computeUpcomingMeteorShowers(
  from: Date,
  days: number = WINDOW_DAYS,
): UpcomingMeteorShower[] {
  const end = new Date(from.getTime() + days * 86_400_000)
  const startYear = from.getUTCFullYear()
  const endYear = end.getUTCFullYear()

  const upcoming: UpcomingMeteorShower[] = []
  for (const shower of METEOR_SHOWERS) {
    for (let year = startYear; year <= endYear; year++) {
      const peak = new Date(Date.UTC(year, shower.peakMonth - 1, shower.peakDay))
      if (peak >= from && peak <= end) {
        upcoming.push({ name: shower.name, peak, zhr: shower.zhr })
      }
    }
  }

  return upcoming.sort((a, b) => a.peak.getTime() - b.peak.getTime())
}
