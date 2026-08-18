import { EventDot } from './EventDot'
import type { CalendarEvent } from './calendarEvents'

interface CalendarDayPanelProps {
  dayLabel: string
  events: CalendarEvent[]
  onClose: () => void
}

export function CalendarDayPanel({ dayLabel, events, onClose }: CalendarDayPanelProps) {
  return (
    <div className="events-calendar-day-panel">
      <div className="events-calendar-day-panel-header">
        <h3>{dayLabel}</h3>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      {events.length === 0 ? (
        <p className="hint">No events this day.</p>
      ) : (
        <ul className="events-calendar-day-panel-list">
          {events.map((event) => {
            // ISS entries are pre-filtered to visible-only (see
            // computeCalendarEvents), so the status line would always read
            // "Visible" — redundant. Eclipses still vary and keep it.
            const showVisibility = event.visibility && event.type !== 'iss'
            return (
              <li key={event.id} className={showVisibility ? (event.visibility!.visible ? 'visible' : 'not-visible') : ''}>
                <EventDot type={event.type} />
                <div>
                  <div className="events-calendar-day-panel-title">
                    {event.title}
                    {event.timeLabel && <> · {event.timeLabel}</>}
                  </div>
                  <div className="events-calendar-day-panel-desc">{event.description}</div>
                  {showVisibility && (
                    <div className="events-calendar-day-panel-status">
                      {event.visibility!.visible ? 'Visible' : `Not visible — ${event.visibility!.reason}`}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
