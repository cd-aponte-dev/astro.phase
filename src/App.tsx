import { useMemo } from 'react'
import { Observer } from 'astronomy-engine'
import { computeTonightWindow, computeTonightsSky, type SkyObject } from './astronomy'
import { FIXED_LOCATION } from './location'
import './App.css'

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function formatTime(date: Date | null): string {
  return date ? timeFormatter.format(date) : '—'
}

const BODY_LABELS: Record<SkyObject['body'], string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
}

const PLANETS = new Set<SkyObject['body']>(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'])

function App() {
  const { window, sky, error } = useMemo(() => {
    try {
      const observer = new Observer(FIXED_LOCATION.latitude, FIXED_LOCATION.longitude, 0)
      const now = new Date()
      const nightWindow = computeTonightWindow(observer, now)
      const sky = computeTonightsSky(observer, nightWindow)
      return { window: nightWindow, sky, error: null as string | null }
    } catch (err) {
      return {
        window: null,
        sky: [] as SkyObject[],
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }, [])

  return (
    <div className="page">
      <header>
        <h1>Tonight&rsquo;s Sky</h1>
        <p className="location">{FIXED_LOCATION.name}</p>
        {window && (
          <p className="window">
            {dateFormatter.format(window.start)} · {timeFormatter.format(window.start)} &ndash;{' '}
            {timeFormatter.format(window.end)}
          </p>
        )}
      </header>

      {error && <p className="error">{error}</p>}

      <ul className="sky-list">
        {sky.map((obj) => (
          <li key={obj.body} className="sky-object">
            <div className="sky-object-name">{BODY_LABELS[obj.body]}</div>

            {!obj.isUpTonight ? (
              <div className="sky-object-status not-up">Not up tonight</div>
            ) : (
              <div className="sky-object-times">
                <span>
                  <span className="label">Rise</span> {obj.rise ? formatTime(obj.rise) : 'already up'}
                </span>
                <span>
                  <span className="label">Set</span>{' '}
                  {obj.set ? formatTime(obj.set) : 'stays up till dawn'}
                </span>
                {PLANETS.has(obj.body) && (
                  <span>
                    <span className="label">Transit</span> {formatTime(obj.transit)}
                  </span>
                )}
              </div>
            )}

            {obj.body === 'Moon' && obj.moonPhaseName && (
              <div className="moon-detail">
                {obj.moonPhaseName} · {Math.round(obj.moonIlluminationPercent ?? 0)}% illuminated
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
