import { describe, expect, it } from 'vitest'
import { computeUpcomingIssPasses, type TleSnapshot } from './issPasses'

// A real ISS TLE, frozen in time — using a fixed snapshot (rather than the
// live one in src/data/) keeps this test's expected passes stable forever.
const tle: TleSnapshot = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   26227.08368476  .00005059  00000+0  98393-4 0  9995',
  line2: '2 25544  51.6330   8.6029 0007564  47.5489 312.6138 15.49446478580889',
  fetchedAt: '2026-08-15T17:47:16.966Z',
}

const nyc = { name: 'New York, NY', latitude: 40.7128, longitude: -74.006 }
const from = new Date('2026-08-15T00:00:00Z')

describe('computeUpcomingIssPasses', () => {
  const passes = computeUpcomingIssPasses(tle, nyc, from)

  it('finds every geometric pass in the 5-day window', () => {
    expect(passes).toHaveLength(35)
  })

  it('keeps rise, max-elevation, and set in order within the search window', () => {
    const windowEnd = new Date(from.getTime() + 5 * 86_400_000)
    for (const pass of passes) {
      expect(pass.rise.getTime()).toBeLessThanOrEqual(pass.maxElevation.getTime())
      expect(pass.maxElevation.getTime()).toBeLessThanOrEqual(pass.set.getTime())
      expect(pass.rise.getTime()).toBeGreaterThanOrEqual(from.getTime())
      expect(pass.set.getTime()).toBeLessThanOrEqual(windowEnd.getTime())
      expect(pass.maxElevationDegrees).toBeGreaterThanOrEqual(0)
    }
  })

  it('marks a pre-dawn pass visible', () => {
    expect(passes[0]).toMatchObject({ visible: true, reason: null })
    expect(passes[0].rise.toISOString()).toBe('2026-08-15T08:20:00.000Z')
  })

  it('marks a daytime pass not visible, with a daylight reason', () => {
    expect(passes[1]).toMatchObject({ visible: false, reason: 'happens in daylight' })
  })

  it('marks a pass in Earth’s shadow not visible, with a shadow reason', () => {
    const eclipsed = passes.find((pass) => pass.reason === "in Earth's shadow")
    expect(eclipsed).toMatchObject({ visible: false })
  })

  it('returns no passes for a window with zero duration', () => {
    expect(computeUpcomingIssPasses(tle, nyc, from, 0)).toEqual([])
  })
})
