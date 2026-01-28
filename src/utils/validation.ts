import { isValidLocator } from './maidenhead'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateLocator(locator: string): ValidationResult {
  if (!locator || !locator.trim()) {
    return { valid: false, error: 'validation.required' }
  }

  if (!isValidLocator(locator)) {
    return { valid: false, error: 'validation.invalidLocator' }
  }

  return { valid: true }
}

export function validateLatitude(value: string | number): ValidationResult {
  if (value === '' || value === undefined || value === null) {
    return { valid: false, error: 'validation.required' }
  }

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num) || num < -90 || num > 90) {
    return { valid: false, error: 'validation.invalidLatitude' }
  }

  return { valid: true }
}

export function validateLongitude(value: string | number): ValidationResult {
  if (value === '' || value === undefined || value === null) {
    return { valid: false, error: 'validation.required' }
  }

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num) || num < -180 || num > 180) {
    return { valid: false, error: 'validation.invalidLongitude' }
  }

  return { valid: true }
}

export function validateCoordinates(
  latitude: string | number,
  longitude: string | number
): ValidationResult {
  const latResult = validateLatitude(latitude)
  if (!latResult.valid) return latResult

  const lonResult = validateLongitude(longitude)
  if (!lonResult.valid) return lonResult

  return { valid: true }
}

export function parseCoordinate(value: string): number | null {
  // Unterstützt verschiedene Formate:
  // - Dezimal: 47.5, -47.5
  // - Grad/Minuten: 47°30'N, 47 30 N
  // - Grad/Minuten/Sekunden: 47°30'30"N

  const trimmed = value.trim()

  // Einfaches Dezimalformat
  const decimal = parseFloat(trimmed)
  if (!isNaN(decimal)) {
    return decimal
  }

  // DMS Format: 47°30'30"N oder 47 30 30 N
  const dmsMatch = trimmed.match(
    /^(-?)(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)?["\s]*([NSEW])?$/i
  )
  if (dmsMatch) {
    const sign = dmsMatch[1] === '-' ? -1 : 1
    const degrees = parseInt(dmsMatch[2])
    const minutes = parseInt(dmsMatch[3])
    const seconds = parseFloat(dmsMatch[4] || '0')
    const direction = dmsMatch[5]?.toUpperCase()

    let result = sign * (degrees + minutes / 60 + seconds / 3600)

    if (direction === 'S' || direction === 'W') {
      result = -Math.abs(result)
    }

    return result
  }

  // DM Format: 47°30.5'N oder 47 30.5 N
  const dmMatch = trimmed.match(
    /^(-?)(\d+)[°\s]+(\d+(?:\.\d+)?)['\s]*([NSEW])?$/i
  )
  if (dmMatch) {
    const sign = dmMatch[1] === '-' ? -1 : 1
    const degrees = parseInt(dmMatch[2])
    const minutes = parseFloat(dmMatch[3])
    const direction = dmMatch[4]?.toUpperCase()

    let result = sign * (degrees + minutes / 60)

    if (direction === 'S' || direction === 'W') {
      result = -Math.abs(result)
    }

    return result
  }

  return null
}

export function formatCoordinate(
  value: number,
  type: 'latitude' | 'longitude',
  format: 'decimal' | 'dms' = 'decimal'
): string {
  if (format === 'decimal') {
    return value.toFixed(6)
  }

  const absolute = Math.abs(value)
  const degrees = Math.floor(absolute)
  const minutesFloat = (absolute - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = (minutesFloat - minutes) * 60

  let direction: string
  if (type === 'latitude') {
    direction = value >= 0 ? 'N' : 'S'
  } else {
    direction = value >= 0 ? 'E' : 'W'
  }

  return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`
}
