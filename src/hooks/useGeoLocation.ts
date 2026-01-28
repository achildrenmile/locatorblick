import { useState, useCallback } from 'react'
import type { Coordinates } from '@/types'

type GeoLocationStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseGeoLocationResult {
  coordinates: Coordinates | null
  status: GeoLocationStatus
  error: string | null
  isSupported: boolean
  requestLocation: () => void
  watchLocation: () => () => void
}

export function useGeoLocation(): UseGeoLocationResult {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState<GeoLocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setCoordinates({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
    setStatus('success')
    setError(null)
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    setStatus('error')
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('Standort-Zugriff verweigert')
        break
      case error.POSITION_UNAVAILABLE:
        setError('Standort nicht verfügbar')
        break
      case error.TIMEOUT:
        setError('Zeitüberschreitung bei Standortabfrage')
        break
      default:
        setError('Unbekannter Fehler')
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setError('Geolocation wird nicht unterstützt')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    })
  }, [isSupported, handleSuccess, handleError])

  const watchLocation = useCallback(() => {
    if (!isSupported) {
      setError('Geolocation wird nicht unterstützt')
      setStatus('error')
      return () => {}
    }

    setStatus('loading')
    setError(null)

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isSupported, handleSuccess, handleError])

  return {
    coordinates,
    status,
    error,
    isSupported,
    requestLocation,
    watchLocation
  }
}
