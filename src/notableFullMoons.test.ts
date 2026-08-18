import { describe, expect, it } from 'vitest'
import { computeUpcomingFullMoons } from './notableFullMoons'

describe('computeUpcomingFullMoons', () => {
  it('finds the full moons that fall within the supermoon threshold of perigee', () => {
    const from = new Date('2026-10-01T00:00:00Z')
    const moons = computeUpcomingFullMoons(from, 90)
    const supermoons = moons.filter((m) => m.facts.supermoon)

    expect(supermoons.map((m) => m.date.toISOString())).toEqual([
      '2026-11-24T14:54:04.191Z',
      '2026-12-24T01:28:45.040Z',
    ])
    for (const moon of supermoons) {
      expect(moon.facts.blueMoon).toBe(false)
      expect(moon.facts.harvestMoon).toBe(false)
    }
  })

  it('includes a full moon whose distance falls outside the supermoon threshold, with no facts set', () => {
    const from = new Date('2026-10-01T00:00:00Z')
    const moons = computeUpcomingFullMoons(from, 90)
    const octoberFullMoon = moons.find(
      (m) => m.date.getTime() === new Date('2026-10-26T04:12:15.538Z').getTime(),
    )
    expect(octoberFullMoon).toBeDefined()
    expect(octoberFullMoon!.facts).toEqual({ supermoon: false, blueMoon: false, harvestMoon: false })
  })

  it('flags the second full moon in a calendar month as a blue moon, and the first as plain', () => {
    const from = new Date('2026-04-15T00:00:00Z')
    const moons = computeUpcomingFullMoons(from, 60)

    expect(moons.map((m) => m.date.toISOString())).toEqual([
      '2026-05-01T17:23:47.564Z',
      '2026-05-31T08:45:48.291Z',
    ])
    expect(moons[0].facts).toEqual({ supermoon: false, blueMoon: false, harvestMoon: false })
    expect(moons[1].facts).toEqual({ supermoon: false, blueMoon: true, harvestMoon: false })
  })

  it('flags the full moon nearest the September equinox as a harvest moon', () => {
    const from = new Date('2026-09-01T00:00:00Z')
    const moons = computeUpcomingFullMoons(from, 30)

    expect(moons.map((m) => m.date.toISOString())).toEqual(['2026-09-26T16:49:32.233Z'])
    expect(moons[0].facts).toEqual({ supermoon: false, blueMoon: false, harvestMoon: true })
  })

  it('flags a full moon that is both a supermoon and a harvest moon with both facts', () => {
    const from = new Date('2025-09-15T00:00:00Z')
    const moons = computeUpcomingFullMoons(from, 30)

    expect(moons.map((m) => m.date.toISOString())).toEqual(['2025-10-07T03:48:03.710Z'])
    expect(moons[0].facts).toEqual({ supermoon: true, blueMoon: false, harvestMoon: true })
  })

  it('returns no full moons for a window with zero duration', () => {
    expect(computeUpcomingFullMoons(new Date('2026-10-01T00:00:00Z'), 0)).toEqual([])
  })
})
