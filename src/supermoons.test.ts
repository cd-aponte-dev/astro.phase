import { describe, expect, it } from 'vitest'
import { computeUpcomingSupermoons } from './supermoons'

const from = new Date('2026-10-01T00:00:00Z')

describe('computeUpcomingSupermoons', () => {
  const supermoons = computeUpcomingSupermoons(from, 90)

  it('finds the full moons that fall within the supermoon threshold of perigee', () => {
    expect(supermoons.map((s) => s.date.toISOString())).toEqual([
      '2026-11-24T14:54:04.191Z',
      '2026-12-24T01:28:45.040Z',
    ])
  })

  it('excludes a full moon whose distance falls outside the threshold', () => {
    const octoberFullMoon = new Date('2026-10-26T04:12:15.538Z')
    expect(supermoons.some((s) => s.date.getTime() === octoberFullMoon.getTime())).toBe(false)
  })

  it('reports a distance closer than the perigee-range threshold for each match', () => {
    for (const supermoon of supermoons) {
      expect(supermoon.distanceKm).toBeGreaterThan(supermoon.perigeeDistanceKm)
      expect(supermoon.distanceKm).toBeLessThan(supermoon.perigeeDistanceKm * 1.05)
    }
  })

  it('returns no supermoons for a window with zero duration', () => {
    expect(computeUpcomingSupermoons(from, 0)).toEqual([])
  })
})
