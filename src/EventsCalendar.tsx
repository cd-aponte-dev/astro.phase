import { useMemo, useState } from 'react'
import tleSnapshot from './data/iss-tle.json'
import rocketLaunchesSnapshot from './data/rocket-launches.json'
import {
  computeCalendarEvents,
  dayKeyInTimeZone,
  formatDayKeyLabel,
  getMonthGrid,
  groupEventsByDay,
  EVENT_TYPE_META,
  type CalendarEventType,
} from './calendarEvents'
import { EventDot } from './EventDot'
import { CalendarLegend } from './CalendarLegend'
import { CalendarDayPanel } from './CalendarDayPanel'
import type { Location } from './location'

const ALL_TYPES = Object.keys(EVENT_TYPE_META) as CalendarEventType[]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WINDOW_DAYS = 90

interface EventsCalendarProps {
  location: Location
  timeZone: string
}

export function EventsCalendar({ location, timeZone }: EventsCalendarProps) {
  const events = useMemo(
    () =>
      computeCalendarEvents(
        location,
        tleSnapshot,
        rocketLaunchesSnapshot,
        timeZone,
        new Date(),
        WINDOW_DAYS,
      ),
    [location, timeZone],
  )

  const todayKey = dayKeyInTimeZone(new Date(), timeZone)
  const [year, setYear] = useState(Number(todayKey.slice(0, 4)))
  const [month, setMonth] = useState(Number(todayKey.slice(5, 7)))
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Only the providers whose launches actually reach the calendar: the
  // snapshot also holds launches with no confirmed date, which are filtered
  // out upstream, and listing their providers here would offer toggles that
  // can never change what's on screen.
  const providers = useMemo(
    () =>
      Array.from(
        new Set(
          events
            .filter((event) => event.type === 'rocket-launch')
            .map((event) => event.provider!),
        ),
      ).sort(),
    [events],
  )

  // All types/providers active by default (opt-out model); session-only.
  // Tracking what's been switched *off* rather than what's on keeps that
  // default true for providers that appear later, when the snapshot refreshes.
  const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(() => new Set(ALL_TYPES))
  const [hiddenProviders, setHiddenProviders] = useState<Set<string>>(() => new Set())

  function toggleType(type: CalendarEventType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function toggleProvider(provider: string) {
    setHiddenProviders((prev) => {
      const next = new Set(prev)
      if (next.has(provider)) next.delete(provider)
      else next.add(provider)
      return next
    })
  }

  function clearFilters() {
    setActiveTypes(new Set(ALL_TYPES))
    setHiddenProviders(new Set())
  }

  const activeProviders = useMemo(
    () => new Set(providers.filter((provider) => !hiddenProviders.has(provider))),
    [providers, hiddenProviders],
  )

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          activeTypes.has(event.type) &&
          (event.type !== 'rocket-launch' || !hiddenProviders.has(event.provider!)),
      ),
    [events, activeTypes, hiddenProviders],
  )

  const grid = useMemo(() => getMonthGrid(year, month, todayKey), [year, month, todayKey])
  const byDay = useMemo(() => groupEventsByDay(visibleEvents), [visibleEvents])

  function goToMonth(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) {
      m = 1
      y++
    }
    if (m < 1) {
      m = 12
      y--
    }
    setMonth(m)
    setYear(y)
    setSelectedKey(null)
  }

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const selectedEvents = selectedKey ? (byDay.get(selectedKey) ?? []) : []

  return (
    <section className="events-calendar">
      <div className="events-calendar-header">
        <button type="button" onClick={() => goToMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <h3>{monthLabel}</h3>
        <button type="button" onClick={() => goToMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="events-calendar-weekdays">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="events-calendar-grid">
        {grid.map((cell) => {
          const dayEvents = byDay.get(cell.key) ?? []
          return (
            <button
              type="button"
              key={cell.key}
              className={[
                'events-calendar-cell',
                !cell.inCurrentMonth && 'outside',
                cell.isToday && 'today',
                selectedKey === cell.key && 'selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedKey(cell.key === selectedKey ? null : cell.key)}
            >
              <span className="events-calendar-cell-day">{cell.day}</span>
              {dayEvents.length > 0 && (
                <span className="events-calendar-cell-dots">
                  {dayEvents.map((event) => (
                    <EventDot key={event.id} type={event.type} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <CalendarLegend
        activeTypes={activeTypes}
        onToggleType={toggleType}
        providers={providers}
        activeProviders={activeProviders}
        onToggleProvider={toggleProvider}
      />

      {selectedKey && (
        <CalendarDayPanel
          dayLabel={formatDayKeyLabel(selectedKey)}
          events={selectedEvents}
          onClose={() => setSelectedKey(null)}
        />
      )}

      <div className="events-calendar-footer">
        <button type="button" className="clear-filters" onClick={clearFilters}>
          Clear filters
        </button>
      </div>
    </section>
  )
}
