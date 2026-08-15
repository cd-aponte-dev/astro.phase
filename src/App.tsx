import { useMemo, useState, type FormEvent } from 'react'
import { Observer } from 'astronomy-engine'
import { computeTonightWindow, computeTonightsSky, type SkyObject } from './astronomy'
import { searchPlace, type GeocodeCandidate } from './geocoding'
import { timeZoneForLocation } from './timezone'
import { formatDate, formatTime } from './format'
import { IssPassesSection } from './IssPassesSection'
import { EventsSection } from './EventsSection'
import type { Location } from './location'
import './App.css'

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
  const [location, setLocation] = useState<Location | null>(null)
  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<GeocodeCandidate[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const { window, sky, timeZone, error } = useMemo(() => {
    if (!location) {
      return { window: null, sky: [] as SkyObject[], timeZone: null, error: null as string | null }
    }
    try {
      const observer = new Observer(location.latitude, location.longitude, 0)
      const nightWindow = computeTonightWindow(observer, new Date())
      const sky = computeTonightsSky(observer, nightWindow)
      const timeZone = timeZoneForLocation(location.latitude, location.longitude)
      return { window: nightWindow, sky, timeZone, error: null as string | null }
    } catch (err) {
      return {
        window: null,
        sky: [] as SkyObject[],
        timeZone: null,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }, [location])

  function selectCandidate(candidate: GeocodeCandidate) {
    setLocation({
      name: candidate.displayName,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
    })
    setCandidates(null)
    setSearchError(null)
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setSearchError(null)
    setCandidates(null)

    try {
      const results = await searchPlace(trimmed)
      if (results.length === 0) {
        setSearchError(`No matches found for “${trimmed}”.`)
      } else if (results.length === 1) {
        selectCandidate(results[0])
      } else {
        setCandidates(results)
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Tonight&rsquo;s Sky</h1>

        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a place…"
            aria-label="Place name"
          />
          <button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {searchError && <p className="error">{searchError}</p>}

        {candidates && (
          <ul className="candidates">
            {candidates.map((candidate) => (
              <li key={`${candidate.latitude},${candidate.longitude}`}>
                <button type="button" onClick={() => selectCandidate(candidate)}>
                  {candidate.displayName}
                </button>
              </li>
            ))}
          </ul>
        )}

        {location && (
          <>
            <p className="location">{location.name}</p>
            {window && timeZone && (
              <p className="window">
                {formatDate(window.start, timeZone)} · {formatTime(window.start, timeZone)} &ndash;{' '}
                {formatTime(window.end, timeZone)}
              </p>
            )}
          </>
        )}

        {!location && !candidates && !searchError && (
          <p className="hint">Search for a place to see what&rsquo;s visible tonight.</p>
        )}
      </header>

      {error && <p className="error">{error}</p>}

      {location && timeZone && (
        <ul className="sky-list">
          {sky.map((obj) => (
            <li key={obj.body} className="sky-object">
              <div className="sky-object-name">{BODY_LABELS[obj.body]}</div>

              {!obj.isUpTonight ? (
                <div className="sky-object-status not-up">Not up tonight</div>
              ) : (
                <div className="sky-object-times">
                  <span>
                    <span className="label">Rise</span>{' '}
                    {obj.rise ? formatTime(obj.rise, timeZone) : 'already up'}
                  </span>
                  <span>
                    <span className="label">Set</span>{' '}
                    {obj.set ? formatTime(obj.set, timeZone) : 'stays up till dawn'}
                  </span>
                  {PLANETS.has(obj.body) && (
                    <span>
                      <span className="label">Transit</span> {formatTime(obj.transit, timeZone)}
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
      )}

      {location && timeZone && <EventsSection location={location} timeZone={timeZone} />}

      {location && timeZone && <IssPassesSection location={location} timeZone={timeZone} />}
    </div>
  )
}

export default App
