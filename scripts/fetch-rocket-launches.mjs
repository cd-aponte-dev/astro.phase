#!/usr/bin/env node
// Fetches upcoming rocket launches from the Launch Library 2 API and writes a
// snapshot the app can read at build time. The public free tier is rate
// limited (roughly 15 requests/hour), so this only runs from the scheduled
// GitHub Action — never from the client at runtime.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Wider than the calendar's default 90-day window so the snapshot doesn't
// need refreshing just because the window shifts slightly.
const WINDOW_DAYS = 120

// The API silently caps `limit` at 100 and paginates the rest, so asking for
// more just loses the overflow. Page through instead, bounded so a runaway
// `next` chain can't hammer a rate-limited endpoint.
const PAGE_SIZE = 100
const MAX_PAGES = 5

const OUTPUT_PATH = fileURLToPath(new URL('../src/data/rocket-launches.json', import.meta.url))

const until = new Date(Date.now() + WINDOW_DAYS * 86_400_000).toISOString()
const results = []
let url = `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${PAGE_SIZE}&mode=normal&net__lte=${until}`

for (let page = 0; page < MAX_PAGES && url; page++) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Launch Library 2 fetch failed: ${response.status}`)
  }

  const pageBody = await response.json()
  results.push(...pageBody.results)
  url = pageBody.next
}

const body = { results }

// net_precision finer than "Day" (Second/Minute/Hour/Day) means the launch
// has a specific calendar day to place on the calendar; anything coarser
// (Month/Quarter/Half/Year) is a rough estimate and gets excluded downstream.
const DAY_LEVEL_PRECISION = new Set(['Second', 'Minute', 'Hour', 'Day'])

const launches = body.results.map((launch) => ({
  id: launch.id,
  name: launch.name,
  provider: launch.launch_service_provider?.name ?? 'Unknown',
  providerType: launch.launch_service_provider?.type ?? 'Unknown',
  site: launch.pad?.location?.name ?? 'Unknown',
  net: launch.net,
  dayPrecision: DAY_LEVEL_PRECISION.has(launch.net_precision?.name),
}))

const snapshot = {
  fetchedAt: new Date().toISOString(),
  launches,
}

writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
console.log(`Wrote ${OUTPUT_PATH} (${launches.length} launches)`)
