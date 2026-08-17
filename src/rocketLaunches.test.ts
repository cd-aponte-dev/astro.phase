import { describe, expect, it } from 'vitest'
import { computeUpcomingRocketLaunches, type RocketLaunchSnapshot } from './rocketLaunches'

const from = new Date('2026-08-15T00:00:00Z')

const snapshot: RocketLaunchSnapshot = {
  fetchedAt: '2026-08-15T00:00:00Z',
  launches: [
    {
      id: 'confirmed-1',
      name: 'Falcon 9 Block 5 | Starlink Group 17-50',
      provider: 'SpaceX',
      providerType: 'Commercial',
      site: 'Vandenberg SFB, CA, USA',
      net: '2026-08-20T02:00:00Z',
      dayPrecision: true,
    },
    {
      id: 'tbd-1',
      name: 'Electron | LOXSAT 1',
      provider: 'Rocket Lab',
      providerType: 'Commercial',
      site: 'Rocket Lab Launch Complex 1, Mahia Peninsula, New Zealand',
      net: '2026-08-31T00:00:00Z',
      dayPrecision: false,
    },
  ],
}

describe('computeUpcomingRocketLaunches', () => {
  it('includes launches confirmed to day-level precision', () => {
    const launches = computeUpcomingRocketLaunches(snapshot, from, 90)
    expect(launches.some((l) => l.id === 'confirmed-1')).toBe(true)
  })

  it('excludes launches whose date is only a rough estimate (TBD)', () => {
    const launches = computeUpcomingRocketLaunches(snapshot, from, 90)
    expect(launches.some((l) => l.id === 'tbd-1')).toBe(false)
  })

  it('returns no launches for a window with zero duration', () => {
    expect(computeUpcomingRocketLaunches(snapshot, from, 0)).toEqual([])
  })
})
