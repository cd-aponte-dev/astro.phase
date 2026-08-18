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
const ALL_PROVIDERS = Array.from(
  new Set(rocketLaunchesSnapshot.launches.map((launch) => launch.provider)),
).sort()

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

  // All types/providers active by default (opt-out model); session-only.
  const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(() => new Set(ALL_TYPES))
  const [activeProviders, setActiveProviders] = useState<Set<string>>(() => new Set(ALL_PROVIDERS))

  function toggleType(type: CalendarEventType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function toggleProvider(provider: string) {
    setActiveProviders((prev) => {
      const next = new Set(prev)
      if (next.has(provider)) next.delete(provider)
      else next.add(provider)
      return next
    })
  }

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          activeTypes.has(event.type) &&
          (event.type !== 'rocket-launch' || activeProviders.has(event.provider!)),
      ),
    [events, activeTypes, activeProviders],
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
        providers={ALL_PROVIDERS}
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
    </section>
  )
}
