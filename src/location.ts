export interface Location {
  name: string
  latitude: number
  longitude: number
}

// Placeholder until ticket 4 adds place-name search.
export const FIXED_LOCATION: Location = {
  name: 'New York City, NY, USA',
  latitude: 40.7128,
  longitude: -74.006,
}
