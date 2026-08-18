import { Observer } from 'astronomy-engine'
import { computeUpcomingIssPasses, type TleSnapshot } from './issPasses'
import { computeUpcomingNotableFullMoons } from './notableFullMoons'
import { computeUpcomingLunarEclipses } from './lunarEclipses'
import { computeUpcomingSolarEclipses } from './solarEclipses'
import { computeUpcomingMeteorShowers } from './meteorShowers'
import { computeUpcomingRocketLaunches, type RocketLaunchSnapshot } from './rocketLaunches'
import { formatTime } from './format'
import type { Location } from './location'

export type CalendarEventType =
  | 'iss'
  | 'notable-full-moon'
  | 'lunar-eclipse'
  | 'solar-eclipse'
  | 'meteor-shower'
  | 'rocket-launch'

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  date: Date
  dayKey: string
  timeLabel: string
  title: string
  description: string
  visibility: { visible: boolean; reason: string | null } | null
  /** rocket-launch entries only — the launch provider, for provider filtering */
  provider?: string
}

// Colors validated with the dataviz skill's palette checker (all-pairs, dark
// surface #1f2028): blue/orange/aqua clear every check together — those are
// the only three that can, per the skill's own reference palette: past three
// slots, no hue ordering clears the all-pairs floors, so every slot after
// that leans on shape rather than hue for CVD safety. The ISS marker reuses
// the app's existing accent purple but as a DIAMOND. Solar eclipse takes the
// palette's next documented hue (yellow) as a RING (an annular eclipse's
// namesake shape). Rocket launch takes the following documented hue (red) as
// a TRIANGLE (a nose cone).
export const EVENT_TYPE_META: Record<
  CalendarEventType,
  { label: string; color: string; shape: 'circle' | 'diamond' | 'ring' | 'triangle' }
> = {
  'notable-full-moon': { label: 'Notable full moon', color: '#3987e5', shape: 'circle' },
  'lunar-eclipse': { label: 'Lunar eclipse', color: '#d95926', shape: 'circle' },
  'meteor-shower': { label: 'Meteor shower', color: '#199e70', shape: 'circle' },
  iss: { label: 'ISS pass', color: '#c084fc', shape: 'diamond' },
  'solar-eclipse': { label: 'Solar eclipse', color: '#c98500', shape: 'ring' },
  'rocket-launch': { label: 'Rocket launch', color: '#e66767', shape: 'triangle' },
}

function capitalize(word: string): string {
  return word[0].toUpperCase() + word.slice(1)
}

export function dayKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// ISS passes are only reliably predictable ~5 days out; the other event
// types go further. Ask for `days`, but cap the ISS lookup at what the TLE
// data can actually support.
const ISS_RELIABLE_DAYS = 5

export function computeCalendarEvents(
  location: Location,
  tle: TleSnapshot,
  rocketLaunches: RocketLaunchSnapshot,
  timeZone: string,
  from: Date,
  days: number,
): CalendarEvent[] {
  const observer = new Observer(location.latitude, location.longitude, 0)
  const events: CalendarEvent[] = []

  // Only visible passes are shown here — the ISS clears the horizon several
  // times a day, and most of those passes are invisible (daylight or
  // Earth's shadow). Including them buried the rare stuff (eclipses,
  // notable full moons, showers) under a wall of "not visible" ISS entries.
  const visibleIssPasses = computeUpcomingIssPasses(
    tle,
    location,
    from,
    Math.min(days, ISS_RELIABLE_DAYS),
  ).filter((pass) => pass.visible)

  for (const pass of visibleIssPasses) {
    events.push({
      id: `iss-${pass.rise.toISOString()}`,
      type: 'iss',
      date: pass.rise,
      dayKey: dayKeyInTimeZone(pass.rise, timeZone),
      timeLabel: formatTime(pass.rise, timeZone),
      title: 'ISS pass',
      description: `Rise ${formatTime(pass.rise, timeZone)} · max ${Math.round(pass.maxElevationDegrees)}° at ${formatTime(pass.maxElevation, timeZone)} · set ${formatTime(pass.set, timeZone)}`,
      visibility: { visible: pass.visible, reason: pass.reason },
    })
  }

  for (const moon of computeUpcomingNotableFullMoons(from, days)) {
    const facts: string[] = []
    if (moon.facts.supermoon) facts.push('Supermoon')
    if (moon.facts.blueMoon) facts.push('Blue moon')
    if (moon.facts.harvestMoon) facts.push('Harvest moon')

    const description = [`Full moon at ${Math.round(moon.distanceKm).toLocaleString()} km`]
    if (moon.facts.supermoon) {
      description.push(`near this month's perigee of ${Math.round(moon.perigeeDistanceKm).toLocaleString()} km`)
    }
    if (moon.facts.blueMoon) description.push('second full moon this month')
    if (moon.facts.harvestMoon) description.push('nearest full moon to the autumnal equinox')

    events.push({
      id: `notable-full-moon-${moon.date.toISOString()}`,
      type: 'notable-full-moon',
      date: moon.date,
      dayKey: dayKeyInTimeZone(moon.date, timeZone),
      timeLabel: formatTime(moon.date, timeZone),
      title: facts.join(' · '),
      description: description.join(' — '),
      visibility: null,
    })
  }

  for (const eclipse of computeUpcomingLunarEclipses(observer, from, days)) {
    events.push({
      id: `lunar-eclipse-${eclipse.peak.toISOString()}`,
      type: 'lunar-eclipse',
      date: eclipse.peak,
      dayKey: dayKeyInTimeZone(eclipse.peak, timeZone),
      timeLabel: formatTime(eclipse.peak, timeZone),
      title: `${capitalize(eclipse.kind)} lunar eclipse`,
      description: 'Peak of the eclipse',
      visibility: { visible: eclipse.visible, reason: eclipse.reason },
    })
  }

  for (const eclipse of computeUpcomingSolarEclipses(observer, from, days)) {
    events.push({
      id: `solar-eclipse-${eclipse.peak.toISOString()}`,
      type: 'solar-eclipse',
      date: eclipse.peak,
      dayKey: dayKeyInTimeZone(eclipse.peak, timeZone),
      timeLabel: formatTime(eclipse.peak, timeZone),
      title: `${capitalize(eclipse.kind)} solar eclipse`,
      description: `${capitalize(eclipse.kind)} eclipse, ${Math.round(eclipse.obscuration * 100)}% obscuration at peak`,
      visibility: { visible: eclipse.visible, reason: eclipse.reason },
    })
  }

  for (const shower of computeUpcomingMeteorShowers(from, days)) {
    events.push({
      id: `meteor-shower-${shower.name}-${shower.peak.toISOString()}`,
      type: 'meteor-shower',
      date: shower.peak,
      dayKey: dayKeyInTimeZone(shower.peak, timeZone),
      timeLabel: '',
      title: `${shower.name} meteor shower`,
      description: `Peak activity, ZHR ~${shower.zhr}`,
      visibility: null,
    })
  }

  // Global schedule, no location filtering — a launch is only visible in
  // person very close to the pad, so unlike ISS passes this is informational.
  for (const launch of computeUpcomingRocketLaunches(rocketLaunches, from, days)) {
    events.push({
      id: `rocket-launch-${launch.id}`,
      type: 'rocket-launch',
      date: launch.date,
      dayKey: dayKeyInTimeZone(launch.date, timeZone),
      timeLabel: formatTime(launch.date, timeZone),
      title: launch.name,
      description: `${launch.provider} · ${launch.site}`,
      visibility: null,
      provider: launch.provider,
    })
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Human-readable label for a `dayKey` ("YYYY-MM-DD"), e.g. "Thursday,
 * August 20". Builds the date from its UTC components and formats with
 * `timeZone: 'UTC'` — the weekday/month/day only depend on which calendar
 * day this is, not on the searched location's actual time zone, so this
 * avoids re-parsing the key as a local-time string (which would parse in
 * the *browser's* zone and could land on the wrong day when it differs
 * from the searched location's zone).
 */
export function formatDayKeyLabel(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const list = map.get(event.dayKey) ?? []
    list.push(event)
    map.set(event.dayKey, list)
  }
  return map
}

export interface GridDay {
  year: number
  month: number
  day: number
  key: string
  inCurrentMonth: boolean
  isToday: boolean
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** A 42-cell (6-week) grid for `month` (1-12), including the leading/trailing
 * days from adjacent months needed to fill whole weeks. */
export function getMonthGrid(year: number, month: number, todayKey: string): GridDay[] {
  const firstWeekday = weekdayOf(year, month, 1)
  const totalDays = daysInMonth(year, month)
  const cells: GridDay[] = []

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevMonthDays = daysInMonth(prevYear, prevMonth)
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    cells.push({
      year: prevYear,
      month: prevMonth,
      day,
      key: dateKey(prevYear, prevMonth, day),
      inCurrentMonth: false,
      isToday: false,
    })
  }

  for (let day = 1; day <= totalDays; day++) {
    const key = dateKey(year, month, day)
    cells.push({ year, month, day, key, inCurrentMonth: true, isToday: key === todayKey })
  }

  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({
      year: nextYear,
      month: nextMonth,
      day: nextDay,
      key: dateKey(nextYear, nextMonth, nextDay),
      inCurrentMonth: false,
      isToday: false,
    })
    nextDay++
  }

  return cells
}
