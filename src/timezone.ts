import tzLookup from '@photostructure/tz-lookup'

export function timeZoneForLocation(latitude: number, longitude: number): string {
  return tzLookup(latitude, longitude)
}
