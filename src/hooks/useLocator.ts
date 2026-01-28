import { useState, useCallback } from 'react'
import type { Coordinates, LocatorPrecision, Location } from '@/types'
import {
  locatorToCoordinates,
  coordinatesToLocator,
  normalizeLocator,
  getLocatorPrecision
} from '@/utils/maidenhead'

interface UseLocatorResult {
  locator: string
  coordinates: Coordinates | null
  precision: LocatorPrecision | null
  error: string | null
  setLocator: (value: string) => void
  setCoordinates: (coords: Coordinates, precision?: LocatorPrecision) => void
  clear: () => void
  toLocation: (label?: string) => Location | null
}

export function useLocator(initialLocator?: string): UseLocatorResult {
  const [locator, setLocatorState] = useState(initialLocator || '')
  const [coordinates, setCoordinatesState] = useState<Coordinates | null>(() => {
    if (initialLocator) {
      return locatorToCoordinates(initialLocator)
    }
    return null
  })
  const [precision, setPrecision] = useState<LocatorPrecision | null>(() => {
    if (initialLocator) {
      return getLocatorPrecision(initialLocator)
    }
    return null
  })
  const [error, setError] = useState<string | null>(null)

  const setLocator = useCallback((value: string) => {
    setLocatorState(value)
    setError(null)

    if (!value.trim()) {
      setCoordinatesState(null)
      setPrecision(null)
      return
    }

    const normalized = normalizeLocator(value)
    if (normalized) {
      const coords = locatorToCoordinates(normalized)
      setCoordinatesState(coords)
      setPrecision(getLocatorPrecision(normalized))
    } else {
      setError('Ungültiger Locator')
      setCoordinatesState(null)
      setPrecision(null)
    }
  }, [])

  const setCoordinates = useCallback((coords: Coordinates, prec: LocatorPrecision = 6) => {
    setError(null)

    if (coords.latitude < -90 || coords.latitude > 90) {
      setError('Breitengrad muss zwischen -90 und 90 liegen')
      return
    }

    if (coords.longitude < -180 || coords.longitude > 180) {
      setError('Längengrad muss zwischen -180 und 180 liegen')
      return
    }

    const loc = coordinatesToLocator(coords, prec)
    if (loc) {
      setLocatorState(loc)
      setCoordinatesState(coords)
      setPrecision(prec)
    } else {
      setError('Koordinaten konnten nicht konvertiert werden')
    }
  }, [])

  const clear = useCallback(() => {
    setLocatorState('')
    setCoordinatesState(null)
    setPrecision(null)
    setError(null)
  }, [])

  const toLocation = useCallback((label?: string): Location | null => {
    if (!coordinates || !precision) return null

    const normalized = normalizeLocator(locator)
    if (!normalized) return null

    return {
      id: crypto.randomUUID(),
      locator: normalized,
      coordinates,
      precision,
      label
    }
  }, [locator, coordinates, precision])

  return {
    locator,
    coordinates,
    precision,
    error,
    setLocator,
    setCoordinates,
    clear,
    toLocation
  }
}
