export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distancia en metros
}

export function approximateLocation(
  lat: number,
  lng: number,
  radiusMeters: number = 400
): { lat: number; lng: number } {
  const randomAngle = Math.random() * 2 * Math.PI
  const randomDistance = Math.random() * radiusMeters

  const latOffset = (randomDistance * Math.cos(randomAngle)) / 111320
  const lngOffset =
    (randomDistance * Math.sin(randomAngle)) / (111320 * Math.cos((lat * Math.PI) / 180))

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  }
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

export const PANAMA_CENTER = {
  lat: 8.9824,
  lng: -79.5199,
}

export const PANAMA_BOUNDS = {
  north: 9.6,
  south: 7.2,
  east: -77.2,
  west: -83.0,
}
