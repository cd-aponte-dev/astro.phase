import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchPlace } from './geocoding'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('searchPlace', () => {
  it('maps LocationIQ results to candidates and dedupes exact repeats', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(200, [
        { display_name: 'Paris, France', lat: '48.8566', lon: '2.3522' },
        { display_name: 'Paris, France', lat: '48.8566', lon: '2.3522' },
        { display_name: 'Paris, Texas, USA', lat: '33.6609', lon: '-95.5555' },
      ]),
    )

    const results = await searchPlace('Paris')

    expect(results).toEqual([
      { displayName: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
      { displayName: 'Paris, Texas, USA', latitude: 33.6609, longitude: -95.5555 },
    ])
  })

  it('returns an empty list for LocationIQ’s "no results" 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(404, {}))

    expect(await searchPlace('nowhere at all')).toEqual([])
  })

  it('throws for a real failure response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(500, {}))

    await expect(searchPlace('Paris')).rejects.toThrow('Location search failed (500)')
  })
})
