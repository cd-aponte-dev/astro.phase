import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Observer } from 'astronomy-engine'
import { computeTonightWindow, computeTonightsSky, type SkyObject } from './astronomy'
import { GeocodeRateLimitError, searchPlace, type GeocodeCandidate } from './geocoding'
import { timeZoneForLocation } from './timezone'
import { formatDate, formatTime } from './format'
import { EventsCalendar } from './EventsCalendar'
import { CelestialDisc } from './CelestialDisc'
import type { Location } from './location'
import './App.css'

type Tab = 'sky' | 'events'

const BODY_LABELS: Record<SkyObject['body'], string> = {
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
}

const PLANETS = new Set<SkyObject['body']>(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'])

// Shorter than this and the matches are noise — and every keystroke costs a
// request against LocationIQ's rate limit.
const MIN_QUERY_LENGTH = 3

// Long enough to skip the requests for the letters someone types on the way
// to a word, short enough that the list feels like it's keeping up. Also
// keeps a fast typist under LocationIQ's ~2-per-second limit, which returns
// 429 after about three requests in quick succession.
const SEARCH_DEBOUNCE_MS = 500

function App() {
  const [tab, setTab] = useState<Tab>('sky')
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

  // Search as the user types, rather than waiting for them to submit. Nothing
  // is auto-selected here however few matches come back: the list is only an
  // offer, since the typing isn't necessarily finished.
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setCandidates(null)
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchPlace(trimmed, controller.signal)
        setCandidates(results.length > 0 ? results : null)
        setSearchError(results.length === 0 ? `No matches found for “${trimmed}”.` : null)
      } catch (err) {
        if (controller.signal.aborted) return
        // Brushing the rate limit is a normal consequence of typing quickly.
        // Keep the options already on screen and stay quiet — the next
        // keystroke asks again.
        if (err instanceof GeocodeRateLimitError) return
        setCandidates(null)
        setSearchError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!controller.signal.aborted) setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Submitting takes the top match — the shortcut for someone who typed the
  // place in full and doesn't want to reach for the mouse.
  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    if (candidates && candidates.length > 0) {
      selectCandidate(candidates[0])
      return
    }

    // Submitted before the debounce elapsed, or below the length the live
    // search bothers with — look it up now.
    setIsSearching(true)
    setSearchError(null)
    try {
      const results = await searchPlace(trimmed)
      if (results.length === 0) {
        setSearchError(`No matches found for “${trimmed}”.`)
      } else {
        selectCandidate(results[0])
      }
    } catch (err) {
      setSearchError(
        err instanceof GeocodeRateLimitError
          ? 'Too many searches just now — try again in a moment.'
          : err instanceof Error
            ? err.message
            : String(err),
      )
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="page">
      <header>
        <div className="hero">
          <h1>Tonight&rsquo;s Sky</h1>
          <p className="hero-tagline">Moon phases, planets, and sky events for wherever you are.</p>
        </div>

        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a place…"
            aria-label="Place name"
          />
          {/* Not disabled while searching: a disabled submit button also
              stops Enter from submitting, and the live search means one is
              often in flight. */}
          <button type="submit">{isSearching ? 'Searching…' : 'Search'}</button>
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

        {location && timeZone && (
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'sky'} onClick={() => setTab('sky')}>
              Sky Tonight
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'events'}
              onClick={() => setTab('events')}
            >
              Events Calendar
            </button>
          </div>
        )}
      </header>

      {error && <p className="error">{error}</p>}

      {location && timeZone && tab === 'sky' && (
        <>
          <ul className="sky-list">
            {sky.map((obj) => (
              <li key={obj.body} className="sky-object">
                <div className="sky-object-row">
                  <div className="sky-object-head">
                    <CelestialDisc
                      body={obj.body}
                      moonIlluminationPercent={obj.moonIlluminationPercent}
                      moonPhaseName={obj.moonPhaseName}
                    />
                    <div className="sky-object-name">{BODY_LABELS[obj.body]}</div>
                  </div>

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
                </div>

                {obj.body === 'Moon' && obj.moonPhaseName && (
                  <div className="moon-detail">
                    {obj.moonPhaseName} · {Math.round(obj.moonIlluminationPercent ?? 0)}% illuminated
                  </div>
                )}
              </li>
            ))}
          </ul>

          <p className="transit-note">
            <strong>Transit</strong> is the moment a planet crosses the highest point in its path across
            the sky for this location.
          </p>
        </>
      )}

      {location && timeZone && tab === 'events' && (
        <EventsCalendar location={location} timeZone={timeZone} />
      )}
    </div>
  )
}

export default App
