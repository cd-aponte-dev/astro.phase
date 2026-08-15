import { describe, expect, it } from 'vitest'
import { Observer } from 'astronomy-engine'
import { computeUpcomingLunarEclipses } from './lunarEclipses'

const from = new Date('2026-08-01T00:00:00Z')
const nyc = new Observer(40.7128, -74.006, 0)
const tokyo = new Observer(35.6762, 139.6503, 0)

describe('computeUpcomingLunarEclipses', () => {
  it('finds the partial eclipse in the 90-day window and reports its kind', () => {
    const eclipses = computeUpcomingLunarEclipses(nyc, from, 90)
    expect(eclipses).toHaveLength(1)
    expect(eclipses[0]).toMatchObject({ kind: 'partial' })
    expect(eclipses[0].peak.toISOString()).toBe('2026-08-28T04:12:49.076Z')
  })

  it('marks the eclipse visible where the Moon is above the horizon at peak', () => {
    const eclipses = computeUpcomingLunarEclipses(nyc, from, 90)
    expect(eclipses[0]).toMatchObject({ visible: true, reason: null })
  })

  it('marks the same eclipse not visible where the Moon is below the horizon at peak', () => {
    const eclipses = computeUpcomingLunarEclipses(tokyo, from, 90)
    expect(eclipses[0]).toMatchObject({
      visible: false,
      reason: 'Moon below the horizon at this location',
    })
  })

  it('returns no eclipses for a window with zero duration', () => {
    expect(computeUpcomingLunarEclipses(nyc, from, 0)).toEqual([])
  })
})
