interface EventCardProps {
  title: string
  dateLabel: string
  timeLabel?: string
  description: string
  visibility?: { visible: boolean; reason: string | null } | null
}

export function EventCard({ title, dateLabel, timeLabel, description, visibility }: EventCardProps) {
  const visibilityClass = visibility ? (visibility.visible ? ' visible' : ' not-visible') : ''

  return (
    <li className={`event-card${visibilityClass}`}>
      <div className="event-card-date">
        {dateLabel}
        {timeLabel && <> · {timeLabel}</>}
      </div>
      <div className="event-card-title">{title}</div>
      <div className="event-card-description">{description}</div>
      {visibility && (
        <div className="event-card-status">
          {visibility.visible ? 'Visible' : `Not visible — ${visibility.reason}`}
        </div>
      )}
    </li>
  )
}
