import { EVENT_TYPE_META, type CalendarEventType } from './calendarEvents'
import { EventDot } from './EventDot'

const TYPES = Object.keys(EVENT_TYPE_META) as CalendarEventType[]

export function CalendarLegend() {
  return (
    <ul className="events-calendar-legend" aria-label="Event type legend">
      {TYPES.map((type) => (
        <li key={type}>
          <EventDot type={type} /> {EVENT_TYPE_META[type].label}
        </li>
      ))}
    </ul>
  )
}
