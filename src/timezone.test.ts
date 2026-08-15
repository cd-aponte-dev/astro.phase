import { describe, expect, it } from 'vitest'
import { timeZoneForLocation } from './timezone'

describe('timeZoneForLocation', () => {
  it.each([
    ['Greenwich', 51.4779, -0.0015, 'Europe/London'],
    ['New York City', 40.7128, -74.006, 'America/New_York'],
    ['Sydney', -33.8688, 151.2093, 'Australia/Sydney'],
  ])('resolves %s to %s', (_name, latitude, longitude, expected) => {
    expect(timeZoneForLocation(latitude, longitude)).toBe(expected)
  })
})
