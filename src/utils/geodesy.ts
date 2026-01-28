import * as turf from '@turf/turf'
import type { Coordinates, DistanceResult, BearingResult, CalculationResult, Location } from '@/types'

const EARTH_CIRCUMFERENCE_KM = 40075

/**
 * Entfernung zwischen zwei Punkten berechnen (Großkreis/Kurzweg)
 */
export function calculateDistance(from: Coordinates, to: Coordinates): DistanceResult {
  const point1 = turf.point([from.longitude, from.latitude])
  const point2 = turf.point([to.longitude, to.latitude])

  const kilometers = turf.distance(point1, point2, { units: 'kilometers' })
  const miles = turf.distance(point1, point2, { units: 'miles' })
  const nauticalMiles = kilometers / 1.852

  return {
    kilometers: roundTo(kilometers, 2),
    miles: roundTo(miles, 2),
    nauticalMiles: roundTo(nauticalMiles, 2)
  }
}

/**
 * Peilung von einem Punkt zu einem anderen berechnen
 */
export function calculateBearing(from: Coordinates, to: Coordinates): BearingResult {
  const point1 = turf.point([from.longitude, from.latitude])
  const point2 = turf.point([to.longitude, to.latitude])

  let degrees = turf.bearing(point1, point2)

  // Normalisieren auf 0-360°
  if (degrees < 0) {
    degrees += 360
  }

  return {
    degrees: roundTo(degrees, 1),
    cardinal: degreesToCardinal(degrees)
  }
}

/**
 * Langweg-Entfernung berechnen (um die Erde herum)
 */
export function calculateLongPathDistance(shortPathKm: number): DistanceResult {
  const longPathKm = EARTH_CIRCUMFERENCE_KM - shortPathKm

  return {
    kilometers: roundTo(longPathKm, 2),
    miles: roundTo(longPathKm / 1.60934, 2),
    nauticalMiles: roundTo(longPathKm / 1.852, 2)
  }
}

/**
 * Langweg-Peilung berechnen (entgegengesetzte Richtung)
 */
export function calculateLongPathBearing(shortPathBearing: number): BearingResult {
  const longPathDegrees = (shortPathBearing + 180) % 360

  return {
    degrees: roundTo(longPathDegrees, 1),
    cardinal: degreesToCardinal(longPathDegrees)
  }
}

/**
 * Vollständige Berechnung zwischen zwei Standorten
 */
export function calculateQrbQtf(from: Location, to: Location): CalculationResult {
  const shortDistance = calculateDistance(from.coordinates, to.coordinates)
  const shortBearing = calculateBearing(from.coordinates, to.coordinates)

  const longDistance = calculateLongPathDistance(shortDistance.kilometers)
  const longBearing = calculateLongPathBearing(shortBearing.degrees)

  return {
    from,
    to,
    shortPath: {
      distance: shortDistance,
      bearing: shortBearing
    },
    longPath: {
      distance: longDistance,
      bearing: longBearing
    }
  }
}

/**
 * Punkt auf einem Großkreis in einer bestimmten Entfernung und Richtung berechnen
 */
export function destinationPoint(
  from: Coordinates,
  distanceKm: number,
  bearingDegrees: number
): Coordinates {
  const point = turf.point([from.longitude, from.latitude])
  const destination = turf.destination(point, distanceKm, bearingDegrees, { units: 'kilometers' })

  return {
    latitude: destination.geometry.coordinates[1],
    longitude: destination.geometry.coordinates[0]
  }
}

/**
 * Großkreislinie zwischen zwei Punkten als Array von Koordinaten
 */
export function greatCirclePath(
  from: Coordinates,
  to: Coordinates,
  steps: number = 100
): Coordinates[] {
  const line = turf.greatCircle(
    turf.point([from.longitude, from.latitude]),
    turf.point([to.longitude, to.latitude]),
    { npoints: steps }
  )

  if (line.geometry.type === 'MultiLineString') {
    // Bei Datumsgrenzüberschreitung gibt es mehrere Segmente
    return line.geometry.coordinates.flat().map(coord => ({
      latitude: coord[1],
      longitude: coord[0]
    }))
  }

  return line.geometry.coordinates.map(coord => ({
    latitude: coord[1],
    longitude: coord[0]
  }))
}

/**
 * Mittelpunkt zwischen zwei Koordinaten
 */
export function midpoint(from: Coordinates, to: Coordinates): Coordinates {
  const point1 = turf.point([from.longitude, from.latitude])
  const point2 = turf.point([to.longitude, to.latitude])
  const mid = turf.midpoint(point1, point2)

  return {
    latitude: mid.geometry.coordinates[1],
    longitude: mid.geometry.coordinates[0]
  }
}

/**
 * Grad in Himmelsrichtung umwandeln (16-teilig)
 */
export function degreesToCardinal(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ]

  // Normalisieren auf 0-360
  const normalized = ((degrees % 360) + 360) % 360

  // Index berechnen (22.5° pro Richtung)
  const index = Math.round(normalized / 22.5) % 16

  return directions[index]
}

/**
 * Himmelsrichtung ins Deutsche übersetzen
 */
export function cardinalToGerman(cardinal: string): string {
  const translations: Record<string, string> = {
    'N': 'N',
    'NNE': 'NNO',
    'NE': 'NO',
    'ENE': 'ONO',
    'E': 'O',
    'ESE': 'OSO',
    'SE': 'SO',
    'SSE': 'SSO',
    'S': 'S',
    'SSW': 'SSW',
    'SW': 'SW',
    'WSW': 'WSW',
    'W': 'W',
    'WNW': 'WNW',
    'NW': 'NW',
    'NNW': 'NNW'
  }

  return translations[cardinal] || cardinal
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}
