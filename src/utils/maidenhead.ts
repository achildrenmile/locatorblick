import type { Coordinates, LocatorPrecision, GridSquare } from '@/types'

const FIELD_CHARS = 'ABCDEFGHIJKLMNOPQR'
const SUBSQUARE_CHARS = 'abcdefghijklmnopqrstuvwx'

/**
 * Maidenhead-Locator in Koordinaten (Mittelpunkt) umwandeln
 */
export function locatorToCoordinates(locator: string): Coordinates | null {
  const normalized = normalizeLocator(locator)
  if (!normalized) return null

  const len = normalized.length

  // Feld (2 Zeichen): 20° x 10°
  let longitude = (normalized.charCodeAt(0) - 65) * 20 - 180
  let latitude = (normalized.charCodeAt(1) - 65) * 10 - 90

  // Größe des aktuellen Grids
  let lonSize = 20
  let latSize = 10

  // Square (4 Zeichen): 2° x 1°
  if (len >= 4) {
    lonSize = 2
    latSize = 1
    longitude += parseInt(normalized[2]) * 2
    latitude += parseInt(normalized[3]) * 1
  }

  // Subsquare (6 Zeichen): 5' x 2.5' (0.0833° x 0.0417°)
  if (len >= 6) {
    lonSize = 2 / 24
    latSize = 1 / 24
    longitude += (normalized.charCodeAt(4) - 97) * (2 / 24)
    latitude += (normalized.charCodeAt(5) - 97) * (1 / 24)
  }

  // Extended Square (8 Zeichen): 30" x 15"
  if (len >= 8) {
    lonSize = 2 / 240
    latSize = 1 / 240
    longitude += parseInt(normalized[6]) * (2 / 240)
    latitude += parseInt(normalized[7]) * (1 / 240)
  }

  // Extended Subsquare (10 Zeichen): 1.25" x 0.625"
  if (len >= 10) {
    lonSize = 2 / 240 / 24
    latSize = 1 / 240 / 24
    longitude += (normalized.charCodeAt(8) - 97) * (2 / 240 / 24)
    latitude += (normalized.charCodeAt(9) - 97) * (1 / 240 / 24)
  }

  // Mittelpunkt des Grids
  longitude += lonSize / 2
  latitude += latSize / 2

  return {
    latitude: roundTo(latitude, 8),
    longitude: roundTo(longitude, 8)
  }
}

/**
 * Koordinaten in Maidenhead-Locator umwandeln
 */
export function coordinatesToLocator(
  coords: Coordinates,
  precision: LocatorPrecision = 6
): string | null {
  const { latitude, longitude } = coords

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null
  }

  // Normalisieren auf positive Werte
  let lon = longitude + 180
  let lat = latitude + 90

  let locator = ''

  // Feld (18 x 18)
  const fieldLon = Math.floor(lon / 20)
  const fieldLat = Math.floor(lat / 10)
  locator += FIELD_CHARS[fieldLon] + FIELD_CHARS[fieldLat]
  lon -= fieldLon * 20
  lat -= fieldLat * 10

  if (precision >= 4) {
    // Square (10 x 10 innerhalb des Felds)
    const squareLon = Math.floor(lon / 2)
    const squareLat = Math.floor(lat / 1)
    locator += squareLon.toString() + squareLat.toString()
    lon -= squareLon * 2
    lat -= squareLat * 1
  }

  if (precision >= 6) {
    // Subsquare (24 x 24 innerhalb des Squares)
    const subLon = Math.floor(lon / (2 / 24))
    const subLat = Math.floor(lat / (1 / 24))
    locator += SUBSQUARE_CHARS[Math.min(subLon, 23)] + SUBSQUARE_CHARS[Math.min(subLat, 23)]
    lon -= subLon * (2 / 24)
    lat -= subLat * (1 / 24)
  }

  if (precision >= 8) {
    // Extended Square (10 x 10)
    const extLon = Math.floor(lon / (2 / 240))
    const extLat = Math.floor(lat / (1 / 240))
    locator += Math.min(extLon, 9).toString() + Math.min(extLat, 9).toString()
    lon -= extLon * (2 / 240)
    lat -= extLat * (1 / 240)
  }

  if (precision >= 10) {
    // Extended Subsquare (24 x 24)
    const extSubLon = Math.floor(lon / (2 / 240 / 24))
    const extSubLat = Math.floor(lat / (1 / 240 / 24))
    locator += SUBSQUARE_CHARS[Math.min(extSubLon, 23)] + SUBSQUARE_CHARS[Math.min(extSubLat, 23)]
  }

  return locator
}

/**
 * Grid-Square-Grenzen für einen Locator berechnen
 */
export function getGridBounds(locator: string): GridSquare | null {
  const normalized = normalizeLocator(locator)
  if (!normalized) return null

  const len = normalized.length

  // Startposition (SW-Ecke)
  let west = (normalized.charCodeAt(0) - 65) * 20 - 180
  let south = (normalized.charCodeAt(1) - 65) * 10 - 90

  // Größe
  let lonSize = 20
  let latSize = 10

  if (len >= 4) {
    lonSize = 2
    latSize = 1
    west += parseInt(normalized[2]) * 2
    south += parseInt(normalized[3]) * 1
  }

  if (len >= 6) {
    lonSize = 2 / 24
    latSize = 1 / 24
    west += (normalized.charCodeAt(4) - 97) * (2 / 24)
    south += (normalized.charCodeAt(5) - 97) * (1 / 24)
  }

  if (len >= 8) {
    lonSize = 2 / 240
    latSize = 1 / 240
    west += parseInt(normalized[6]) * (2 / 240)
    south += parseInt(normalized[7]) * (1 / 240)
  }

  if (len >= 10) {
    lonSize = 2 / 240 / 24
    latSize = 1 / 240 / 24
    west += (normalized.charCodeAt(8) - 97) * (2 / 240 / 24)
    south += (normalized.charCodeAt(9) - 97) * (1 / 240 / 24)
  }

  const east = west + lonSize
  const north = south + latSize

  return {
    locator: normalized,
    bounds: {
      north: roundTo(north, 8),
      south: roundTo(south, 8),
      east: roundTo(east, 8),
      west: roundTo(west, 8)
    },
    center: {
      latitude: roundTo(south + latSize / 2, 8),
      longitude: roundTo(west + lonSize / 2, 8)
    }
  }
}

/**
 * Locator normalisieren und validieren
 */
export function normalizeLocator(locator: string): string | null {
  if (!locator || typeof locator !== 'string') return null

  const trimmed = locator.trim()
  const len = trimmed.length

  // Gültige Längen: 2, 4, 6, 8, 10
  if (len < 2 || len > 10 || len % 2 !== 0) return null

  // Großbuchstaben für Feld, Kleinbuchstaben für Subsquares
  let normalized = ''

  // Feld (Buchstaben A-R)
  const field1 = trimmed[0].toUpperCase()
  const field2 = trimmed[1].toUpperCase()
  if (!FIELD_CHARS.includes(field1) || !FIELD_CHARS.includes(field2)) return null
  normalized += field1 + field2

  // Square (Ziffern 0-9)
  if (len >= 4) {
    const sq1 = trimmed[2]
    const sq2 = trimmed[3]
    if (!/[0-9]/.test(sq1) || !/[0-9]/.test(sq2)) return null
    normalized += sq1 + sq2
  }

  // Subsquare (Buchstaben a-x)
  if (len >= 6) {
    const sub1 = trimmed[4].toLowerCase()
    const sub2 = trimmed[5].toLowerCase()
    if (!SUBSQUARE_CHARS.includes(sub1) || !SUBSQUARE_CHARS.includes(sub2)) return null
    normalized += sub1 + sub2
  }

  // Extended Square (Ziffern 0-9)
  if (len >= 8) {
    const ext1 = trimmed[6]
    const ext2 = trimmed[7]
    if (!/[0-9]/.test(ext1) || !/[0-9]/.test(ext2)) return null
    normalized += ext1 + ext2
  }

  // Extended Subsquare (Buchstaben a-x)
  if (len >= 10) {
    const extSub1 = trimmed[8].toLowerCase()
    const extSub2 = trimmed[9].toLowerCase()
    if (!SUBSQUARE_CHARS.includes(extSub1) || !SUBSQUARE_CHARS.includes(extSub2)) return null
    normalized += extSub1 + extSub2
  }

  return normalized
}

/**
 * Prüfen ob ein Locator gültig ist
 */
export function isValidLocator(locator: string): boolean {
  return normalizeLocator(locator) !== null
}

/**
 * Genauigkeit eines Locators bestimmen
 */
export function getLocatorPrecision(locator: string): LocatorPrecision | null {
  const normalized = normalizeLocator(locator)
  if (!normalized) return null
  return normalized.length as LocatorPrecision
}

/**
 * Alle Grid-Squares für einen sichtbaren Kartenbereich generieren
 */
export function generateGridsForBounds(
  bounds: { north: number; south: number; east: number; west: number },
  level: 2 | 4 | 6
): GridSquare[] {
  const grids: GridSquare[] = []

  // Größen je nach Level
  const sizes = {
    2: { lon: 20, lat: 10 },
    4: { lon: 2, lat: 1 },
    6: { lon: 2 / 24, lat: 1 / 24 }
  }

  const size = sizes[level]

  // Grenzen auf Grid-Grenzen runden
  const startLon = Math.floor((bounds.west + 180) / size.lon) * size.lon - 180
  const startLat = Math.floor((bounds.south + 90) / size.lat) * size.lat - 90
  const endLon = Math.ceil((bounds.east + 180) / size.lon) * size.lon - 180
  const endLat = Math.ceil((bounds.north + 90) / size.lat) * size.lat - 90

  for (let lon = startLon; lon < endLon; lon += size.lon) {
    for (let lat = startLat; lat < endLat; lat += size.lat) {
      // Für level 2 verwenden wir 4 als minimale Precision
      const precision = level === 2 ? 4 : level
      const locator = coordinatesToLocator(
        { latitude: lat + size.lat / 2, longitude: lon + size.lon / 2 },
        precision
      )
      // Bei level 2 nur die ersten 2 Zeichen verwenden
      const finalLocator = level === 2 && locator ? locator.slice(0, 2) : locator
      if (finalLocator) {
        const grid = getGridBounds(finalLocator)
        if (grid) grids.push(grid)
      }
    }
  }

  return grids
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}
