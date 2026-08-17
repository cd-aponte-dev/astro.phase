import { describe, expect, it } from 'vitest'
import { Observer } from 'astronomy-engine'
import { computeUpcomingSolarEclipses } from './solarEclipses'

const from = new Date('2026-08-01T00:00:00Z')
const nyc = new Observer(40.7128, -74.006, 0)
const moscow = new Observer(55.7558, 37.6173, 0)

describe('computeUpcomingSolarEclipses', () => {
  it('finds the partial eclipse in the 90-day window and reports its kind and obscuration', () => {
    const eclipses = computeUpcomingSolarEclipses(nyc, from, 90)
    expect(eclipses).toHaveLength(1)
    expect(eclipses[0]).toMatchObject({ kind: 'partial' })
    expect(eclipses[0].obscuration).toBeCloseTo(0.094, 2)
    expect(eclipses[0].peak.toISOString()).toBe('2026-08-12T17:53:55.332Z')
  })

  it('marks the eclipse visible where the Sun is above the horizon at peak', () => {
    const eclipses = computeUpcomingSolarEclipses(nyc, from, 90)
    expect(eclipses[0]).toMatchObject({ visible: true, reason: null })
  })

  it('marks the same eclipse not visible where the Sun is below the horizon at peak', () => {
    const eclipses = computeUpcomingSolarEclipses(moscow, from, 90)
    expect(eclipses[0]).toMatchObject({
      visible: false,
      reason: 'Sun below the horizon at this location',
    })
  })

  it('returns no eclipses for a window with zero duration', () => {
    expect(computeUpcomingSolarEclipses(nyc, from, 0)).toEqual([])
  })
})
