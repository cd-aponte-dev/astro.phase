import type { CSSProperties } from 'react'
import { EVENT_TYPE_META, type CalendarEventType } from './calendarEvents'

export function EventDot({ type }: { type: CalendarEventType }) {
  const meta = EVENT_TYPE_META[type]
  return (
    <span
      className={`event-dot event-dot-${meta.shape}`}
      style={{ '--dot-color': meta.color } as CSSProperties}
      title={meta.label}
      aria-hidden="true"
    />
  )
}
