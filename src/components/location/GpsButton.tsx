import { useCallback } from 'react'
import { Button } from '@/components/common'
import { de } from '@/i18n/de'
import { useGeoLocation, useLocator } from '@/hooks'
import { useAppContext } from '@/store'

export function GpsButton() {
  const { coordinates, status, error, requestLocation } = useGeoLocation()
  const locator = useLocator()
  const { setCurrentLocation, setMapView } = useAppContext()

  const handleClick = useCallback(() => {
    requestLocation()
  }, [requestLocation])

  // Wenn Koordinaten vorhanden, aktualisieren
  if (coordinates && status === 'success') {
    locator.setCoordinates(coordinates, 6)
    const location = locator.toLocation('Mein Standort')
    if (location) {
      setCurrentLocation(location)
    }
  }

  const handleCenterMap = useCallback(() => {
    if (coordinates) {
      setMapView(coordinates, 12)
    }
  }, [coordinates, setMapView])

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={coordinates ? 'secondary' : 'primary'}
        onClick={coordinates ? handleCenterMap : handleClick}
        loading={status === 'loading'}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      >
        {status === 'loading' ? de.location.loading : de.location.myLocation}
      </Button>

      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}

      {coordinates && locator.locator && (
        <span className="font-mono text-primary-600 font-bold">
          {locator.locator}
        </span>
      )}
    </div>
  )
}
