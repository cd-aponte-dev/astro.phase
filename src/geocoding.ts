export interface GeocodeCandidate {
  displayName: string
  latitude: number
  longitude: number
}

const LOCATIONIQ_SEARCH_URL = 'https://us1.locationiq.com/v1/search'

interface LocationIqResult {
  display_name: string
  lat: string
  lon: string
}

export async function searchPlace(query: string): Promise<GeocodeCandidate[]> {
  const url = new URL(LOCATIONIQ_SEARCH_URL)
  url.searchParams.set('key', import.meta.env.VITE_LOCATIONIQ_API_KEY)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')

  const response = await fetch(url.toString())

  if (response.status === 404) {
    // LocationIQ's "no results" response, not a real error.
    return []
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
