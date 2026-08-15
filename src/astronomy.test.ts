import { describe, expect, it } from 'vitest'
import { Observer } from 'astronomy-engine'
import { computeTonightWindow, computeTonightsSky, sunAltitudeDegrees } from './astronomy'

const greenwich = new Observer(51.4779, -0.0015, 0)

describe('computeTonightWindow', () => {
  it('picks the upcoming night when called during the day', () => {
    const window = computeTonightWindow(greenwich, new Date('2026-03-20T10:00:00Z'))
    expect(window.start.toISOString()).toBe('2026-03-20T18:12:59.742Z')
    expect(window.end.toISOString()).toBe('2026-03-21T06:00:37.014Z')
  })

  it('picks the current night when called after nightfall', () => {
    const window = computeTonightWindow(greenwich, new Date('2026-03-20T22:00:00Z'))
    expect(window.start.toISOString()).toBe('2026-03-20T18:12:59.742Z')
    expect(window.end.toISOString()).toBe('2026-03-21T06:00:37.014Z')
  })
})

describe('sunAltitudeDegrees', () => {
  it('is positive during the day and negative at night', () => {
    expect(sunAltitudeDegrees(greenwich, new Date('2026-03-20T10:00:00Z'))).toBeCloseTo(31.89, 1)
    expect(sunAltitudeDegrees(greenwich, new Date('2026-03-20T22:00:00Z'))).toBeCloseTo(-31.42, 1)
  })
})

describe('computeTonightsSky', () => {
  it('reports the Moon phase and illumination for a known night', () => {
    const window = computeTonightWindow(greenwich, new Date('2026-03-20T22:00:00Z'))
    const sky = computeTonightsSky(greenwich, window)
    const moon = sky.find((obj) => obj.body === 'Moon')

    expect(moon?.moonPhaseName).toBe('Waxing Crescent')
    expect(moon?.moonIlluminationPercent).toBeCloseTo(3.89, 1)
  })

  it('marks every tracked body as up or not, with rise before set when both are known', () => {
    const window = computeTonightWindow(greenwich, new Date('2026-03-20T22:00:00Z'))
    const sky = computeTonightsSky(greenwich, window)

    expect(sky.map((obj) => obj.body)).toEqual([
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
    ])
    // The Sun's own "set" is definitionally the window's start (the sunset
    // that opened the night), so its rise/set pair is naturally out of order.
    for (const obj of sky) {
      if (obj.body === 'Sun') continue
      if (obj.rise && obj.set) {
        expect(obj.rise.getTime()).toBeLessThan(obj.set.getTime())
      }
    }
  })
})
