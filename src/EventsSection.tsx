import { useMemo } from 'react'
import { Observer } from 'astronomy-engine'
import { computeUpcomingSupermoons } from './supermoons'
import { computeUpcomingLunarEclipses } from './lunarEclipses'
import { computeUpcomingMeteorShowers } from './meteorShowers'
import { EventCard } from './EventCard'
import { formatDate, formatTime } from './format'
import type { Location } from './location'

interface EventsSectionProps {
  location: Location
  timeZone: string
}

interface DisplayEvent {
  key: string
  date: Date
  showTime: boolean
  title: string
  description: string
  visibility: { visible: boolean; reason: string | null } | null
}

const WINDOW_DAYS = 90

function capitalize(word: string): string {
  return word[0].toUpperCase() + word.slice(1)
}

export function EventsSection({ location, timeZone }: EventsSectionProps) {
  const events = useMemo<DisplayEvent[]>(() => {
    const observer = new Observer(location.latitude, location.longitude, 0)
    const from = new Date()

    const supermoonEvents: DisplayEvent[] = computeUpcomingSupermoons(from, WINDOW_DAYS).map(
      (supermoon) => ({
        key: `supermoon-${supermoon.date.toISOString()}`,
        date: supermoon.date,
        showTime: true,
        title: 'Supermoon',
        description: `Full moon at ${Math.round(supermoon.distanceKm).toLocaleString()} km — near this month's perigee of ${Math.round(supermoon.perigeeDistanceKm).toLocaleString()} km`,
        visibility: null,
      }),
    )

    const eclipseEvents: DisplayEvent[] = computeUpcomingLunarEclipses(
      observer,
      from,
      WINDOW_DAYS,
    ).map((eclipse) => ({
      key: `lunar-eclipse-${eclipse.peak.toISOString()}`,
      date: eclipse.peak,
      showTime: true,
      title: `${capitalize(eclipse.kind)} lunar eclipse`,
      description: 'Peak of the eclipse',
      visibility: { visible: eclipse.visible, reason: eclipse.reason },
    }))

    const showerEvents: DisplayEvent[] = computeUpcomingMeteorShowers(from, WINDOW_DAYS).map(
      (shower) => ({
        key: `meteor-shower-${shower.name}-${shower.peak.toISOString()}`,
        date: shower.peak,
        showTime: false,
        title: `${shower.name} meteor shower`,
        description: `Peak activity, ZHR ~${shower.zhr}`,
        visibility: null,
      }),
    )

    return [...supermoonEvents, ...eclipseEvents, ...showerEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )
  }, [location])

  return (
    <section className="events">
      <h2>Upcoming Events</h2>

      {events.length === 0 ? (
        <p className="hint">No notable events in the next {WINDOW_DAYS} days.</p>
      ) : (
        <ul className="event-list">
          {events.map((event) => (
            <EventCard
              key={event.key}
              title={event.title}
              dateLabel={formatDate(event.date, timeZone)}
              timeLabel={event.showTime ? formatTime(event.date, timeZone) : undefined}
              description={event.description}
              visibility={event.visibility}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
