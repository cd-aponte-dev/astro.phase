export interface GeocodeCandidate {
  displayName: string
  latitude: number
  longitude: number
}

const LOCATIONIQ_SEARCH_URL = 'https://us1.locationiq.com/v1/search'

/**
 * The geocoder refused because requests came too fast — its free tier allows
 * about two a second. Distinct from a real failure because searching on every
 * pause in typing can legitimately brush the limit, and the fix is simply to
 * ask again in a moment rather than to tell the user something is broken.
 */
export class GeocodeRateLimitError extends Error {
  constructor() {
    super('Too many searches at once.')
    this.name = 'GeocodeRateLimitError'
  }
}

interface LocationIqResult {
  display_name: string
  lat: string
  lon: string
}

/**
 * Places matching `query`. Pass a `signal` to abandon a request that's been
 * superseded — the search runs on every pause in typing, so without it a slow
 * early response can land after a later one and overwrite better results.
 */
export async function searchPlace(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeCandidate[]> {
  const url = new URL(LOCATIONIQ_SEARCH_URL)
  url.searchParams.set('key', import.meta.env.VITE_LOCATIONIQ_API_KEY)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')

  const response = await fetch(url.toString(), { signal })

  if (response.status === 404) {
    // LocationIQ's "no results" response, not a real error.
    return []
  }
  if (response.status === 429) {
    throw new GeocodeRateLimitError()
  }
  if (!response.ok) {
    throw new Error(`Location search failed (${response.status})`)
  }

  const results = (await response.json()) as LocationIqResult[]
  const candidates = results.map((r) => ({
    displayName: r.display_name,
    latitude: Number.parseFloat(r.lat),
    longitude: Number.parseFloat(r.lon),
  }))

  // LocationIQ can return the same place more than once (e.g. matched by
  // multiple OSM records) — collapse those before showing a disambiguation list.
  const seen = new Set<string>()
  return candidates.filter((c) => {
    const key = `${c.displayName}|${c.latitude}|${c.longitude}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
