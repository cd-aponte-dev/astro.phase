import { useState } from 'react'
import { EVENT_TYPE_META, type CalendarEventType } from './calendarEvents'
import { EventDot } from './EventDot'

const TYPES = Object.keys(EVENT_TYPE_META) as CalendarEventType[]

interface CalendarLegendProps {
  activeTypes: Set<CalendarEventType>
  onToggleType: (type: CalendarEventType) => void
  providers: string[]
  activeProviders: Set<string>
  onToggleProvider: (provider: string) => void
}

export function CalendarLegend({
  activeTypes,
  onToggleType,
  providers,
  activeProviders,
  onToggleProvider,
}: CalendarLegendProps) {
  const [providersExpanded, setProvidersExpanded] = useState(false)

  return (
    <ul className="events-calendar-legend" aria-label="Event type filter">
      {TYPES.map((type) => {
        const meta = EVENT_TYPE_META[type]
        const active = activeTypes.has(type)
        const isRocketLaunch = type === 'rocket-launch'

        return (
          <li key={type}>
            <div className="legend-entry">
              <button
                type="button"
                className={`legend-toggle${active ? '' : ' inactive'}`}
                aria-pressed={active}
                onClick={() => onToggleType(type)}
              >
                <EventDot type={type} /> {meta.label}
              </button>

              {isRocketLaunch && providers.length > 0 && (
                <button
                  type="button"
                  className={`legend-expand${providersExpanded ? ' expanded' : ''}`}
                  aria-expanded={providersExpanded}
                  aria-label={
                    providersExpanded ? 'Hide rocket launch providers' : 'Show rocket launch providers'
                  }
                  onClick={() => setProvidersExpanded((prev) => !prev)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path
                      d="M3 5.5 L7 9.5 L11 5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {isRocketLaunch && providersExpanded && (
              <ul className="legend-providers" aria-label="Rocket launch providers">
                {providers.map((provider) => {
                  const providerActive = activeProviders.has(provider)
                  return (
                    <li key={provider}>
                      <button
                        type="button"
                        className={`legend-toggle legend-provider-toggle${providerActive ? '' : ' inactive'}`}
                        aria-pressed={providerActive}
                        onClick={() => onToggleProvider(provider)}
                      >
                        {provider}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
