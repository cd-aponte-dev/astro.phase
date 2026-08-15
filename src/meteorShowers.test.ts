import { describe, expect, it } from 'vitest'
import { computeUpcomingMeteorShowers } from './meteorShowers'

describe('computeUpcomingMeteorShowers', () => {
  it('finds the showers peaking within a 90-day window', () => {
    const from = new Date('2026-08-15T00:00:00Z')
    const showers = computeUpcomingMeteorShowers(from, 90)
    expect(showers.map((s) => s.name)).toEqual(['Orionids'])
  })

  it('sorts results by peak date', () => {
    const from = new Date('2026-08-15T00:00:00Z')
    const showers = computeUpcomingMeteorShowers(from, 90)
    for (let i = 1; i < showers.length; i++) {
      expect(showers[i].peak.getTime()).toBeGreaterThanOrEqual(showers[i - 1].peak.getTime())
    }
  })

  it('handles a window spanning a year boundary', () => {
    const from = new Date('2026-11-20T00:00:00Z')
    const showers = computeUpcomingMeteorShowers(from, 90)
    expect(showers.map((s) => s.name)).toEqual(['Geminids', 'Quadrantids'])
    expect(showers[1].peak.getUTCFullYear()).toBe(2027)
  })

  it('excludes showers that peak just before the window starts or just after it ends', () => {
    const from = new Date('2026-08-15T00:00:00Z')
    const showers = computeUpcomingMeteorShowers(from, 90)
    // Perseids peak Aug 12, three days before the window opens.
    expect(showers.some((s) => s.name === 'Perseids')).toBe(false)
    // Leonids peak Nov 17, four days after the window closes (Nov 13).
    expect(showers.some((s) => s.name === 'Leonids')).toBe(false)
  })

  it('returns no showers for a window with zero duration', () => {
    const from = new Date('2026-08-15T00:00:00Z')
    expect(computeUpcomingMeteorShowers(from, 0)).toEqual([])
  })
})
