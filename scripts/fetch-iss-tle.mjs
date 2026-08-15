#!/usr/bin/env node
// Fetches the current ISS TLE from Celestrak and writes a snapshot the app
// can read at build time. Celestrak rate-limits to roughly one fetch per 2h
// update cycle, so this only runs from the scheduled GitHub Action — never
// from the client at runtime.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE'
const OUTPUT_PATH = fileURLToPath(new URL('../src/data/iss-tle.json', import.meta.url))

const response = await fetch(TLE_URL)
if (!response.ok) {
  throw new Error(`Celestrak fetch failed: ${response.status}`)
}

const text = await response.text()
const lines = text
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0)

if (lines.length < 3) {
  throw new Error(`Unexpected TLE response:\n${text}`)
}

const [name, line1, line2] = lines

const snapshot = {
  name,
  line1,
  line2,
  fetchedAt: new Date().toISOString(),
}

writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
console.log(`Wrote ${OUTPUT_PATH}`)
