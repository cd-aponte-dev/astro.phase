import { describe, expect, it } from 'vitest'
import {
  computeCalendarEvents,
  dayKeyInTimeZone,
  formatDayKeyLabel,
  getMonthGrid,
  groupEventsByDay,
  type CalendarEvent,
} from './calendarEvents'
import type { TleSnapshot } from './issPasses'
import type { RocketLaunchSnapshot } from './rocketLaunches'

describe('dayKeyInTimeZone', () => {
  it('formats a date as YYYY-MM-DD in the given time zone', () => {
    expect(dayKeyInTimeZone(new Date('2026-08-16T12:00:00Z'), 'UTC')).toBe('2026-08-16')
  })

  it('shifts to the previous day when the time zone is behind UTC', () => {
    expect(dayKeyInTimeZone(new Date('2026-08-16T02:00:00Z'), 'America/New_York')).toBe('2026-08-15')
  })
})

describe('formatDayKeyLabel', () => {
  it('labels the exact calendar day regardless of the runner’s local time zone', () => {
    expect(formatDayKeyLabel('2026-08-20')).toBe('Thursday, August 20')
  })
})

describe('getMonthGrid', () => {
  it('returns a 42-cell (6-week) grid', () => {
    expect(getMonthGrid(2026, 8, '2026-08-16')).toHaveLength(42)
  })

  it('marks the requested day as today, within the current month', () => {
    const grid = getMonthGrid(2026, 8, '2026-08-16')
    const today = grid.find((cell) => cell.key === '2026-08-16')
    expect(today).toMatchObject({ isToday: true, inCurrentMonth: true, day: 16 })
  })

  it('fills leading and trailing cells from adjacent months', () => {
    // August 2026 starts on a Saturday, so the grid leads with 6 days of July.
    const grid = getMonthGrid(2026, 8, '2026-08-16')
    expect(grid[0]).toMatchObject({ month: 7, inCurrentMonth: false })
    expect(grid[5]).toMatchObject({ month: 7, day: 31, inCurrentMonth: false })
    expect(grid[6]).toMatchObject({ month: 8, day: 1, inCurrentMonth: true })
    expect(grid[41]).toMatchObject({ month: 9, inCurrentMonth: false })
  })
})

function makeEvent(id: string, dayKey: string): CalendarEvent {
  return {
    id,
    type: 'notable-full-moon',
    date: new Date(`${dayKey}T00:00:00Z`),
    dayKey,
    timeLabel: '',
    title: 'test event',
    description: 'test description',
    visibility: null,
  }
}

describe('groupEventsByDay', () => {
  it('groups events under their dayKey', () => {
    const grouped = groupEventsByDay([
      makeEvent('a', '2026-08-16'),
      makeEvent('b', '2026-08-16'),
      makeEvent('c', '2026-08-17'),
    ])

    expect(grouped.get('2026-08-16')).toHaveLength(2)
    expect(grouped.get('2026-08-17')).toHaveLength(1)
    expect(grouped.get('2026-08-18')).toBeUndefined()
  })
})

// Fixed TLE from issPasses.test.ts, frozen in time so expected passes are stable.
const tle: TleSnapshot = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   26227.08368476  .00005059  00000+0  98393-4 0  9995',
  line2: '2 25544  51.6330   8.6029 0007564  47.5489 312.6138 15.49446478580889',
  fetchedAt: '2026-08-15T17:47:16.966Z',
}

const nyc = { name: 'New York, NY', latitude: 40.7128, longitude: -74.006 }
const from = new Date('2026-08-15T00:00:00Z')
const noLaunches: RocketLaunchSnapshot = { fetchedAt: from.toISOString(), launches: [] }

describe('computeCalendarEvents', () => {
  it('only includes ISS passes that are actually visible', () => {
    const events = computeCalendarEvents(nyc, tle, noLaunches, 'UTC', from, 5)
    const issEvents = events.filter((event) => event.type === 'iss')

    expect(issEvents.length).toBeGreaterThan(0)
    expect(issEvents.every((event) => event.visibility?.visible)).toBe(true)
  })
})
