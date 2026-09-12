#!/usr/bin/env node
// Fetches the current ISS TLE from Celestrak and writes a snapshot the app
// can read at build time. Celestrak rate-limits to roughly one fetch per 2h
// update cycle, so this only runs from the scheduled GitHub Action — never
// from the client at runtime.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE'
const OUTPUT_PATH = fileURLToPath(new URL('../src/data/iss-tle.json', import.meta.url))

// Celestrak's terms of use ask automated clients to identify themselves, and
// it throttles or refuses requests that arrive with a generic agent — the
// likeliest cause of this job's intermittent failures from shared CI IPs.
const USER_AGENT =
  'astro.phase-tle-refresh/1.0 (+https://github.com/cd-aponte-dev/astro.phase)'

const MAX_ATTEMPTS = 3
const RETRY_BASE_MS = 2_000

// How stale the existing snapshot may get before a failed fetch is treated as
// a hard error. SGP4 pass predictions stay accurate for hours, so riding out
// one bad cycle on the previous TLE is fine; a full day of failures is not,
// and should go red rather than rot quietly.
const MAX_SNAPSHOT_AGE_MS = 24 * 60 * 60 * 1000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchTleLines() {
  const response = await fetch(TLE_URL, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`Celestrak fetch failed: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Celestrak reports some errors with a 200 and a plain-text body (e.g. "No
  // GP data found"), so the response shape is checked, not just the status.
  if (lines.length < 3) {
    throw new Error(`Unexpected TLE response: ${text.slice(0, 200)}`)
  }

  return lines.slice(0, 3)
}

async function fetchTleLinesWithRetries() {
  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetchTleLines()
    } catch (error) {
      lastError = error
      console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`)
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_MS * 2 ** (attempt - 1))
      }
    }
  }
  throw lastError
}

function existingSnapshotAgeMs() {
  if (!existsSync(OUTPUT_PATH)) return null
  try {
    const fetchedAt = new Date(JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')).fetchedAt).getTime()
    return Number.isNaN(fetchedAt) ? null : Date.now() - fetchedAt
  } catch {
    return null
  }
}

function hours(ms) {
  return `${(ms / 3_600_000).toFixed(1)}h`
}

try {
  const [name, line1, line2] = await fetchTleLinesWithRetries()

  const snapshot = { name, line1, line2, fetchedAt: new Date().toISOString() }
  writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`Wrote ${OUTPUT_PATH}`)
} catch (error) {
  const ageMs = existingSnapshotAgeMs()

  if (ageMs !== null && ageMs < MAX_SNAPSHOT_AGE_MS) {
    console.warn(
      `Fetch failed (${error.message}). Keeping the existing snapshot, ` +
        `${hours(ageMs)} old — still accurate enough to predict passes.`,
    )
    process.exit(0)
  }

  const state = ageMs === null ? 'is missing or unreadable' : `is already ${hours(ageMs)} old`
  console.error(`Fetch failed and the existing snapshot ${state}.`)
  throw error
}
