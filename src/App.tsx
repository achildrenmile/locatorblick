import { useEffect, useCallback, useState } from 'react'
import { AppProvider, useAppContext } from '@/store'
import { MainLayout } from '@/components/layout'
import { ConverterPanel, BatchConverter } from '@/components/converter'
import { QRBCalculator, MultiPointCompare } from '@/components/calculator'
import { MapView, MapControls, AddressSearch } from '@/components/map'
import { FavoritesList } from '@/components/favorites'
import { GpsButton } from '@/components/location'
import { SunTimesDisplay } from '@/components/sun'
import { Card, Button } from '@/components/common'
import { de } from '@/i18n/de'
import { locatorToCoordinates, normalizeLocator } from '@/utils/maidenhead'
import { formatCoordinate } from '@/utils/validation'
import type { Coordinates, LocatorPrecision } from '@/types'

function AppContent() {
  const { state, setSelectedLocation, setMapView } = useAppContext()
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    }
  }, [])

  // URL-Parameter auslesen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const loc = params.get('loc')
    // TODO: Handle 'from' and 'to' params for calculator deep-linking

    if (loc) {
      const normalized = normalizeLocator(loc)
      if (normalized) {
        const coords = locatorToCoordinates(normalized)
        if (coords) {
          setSelectedLocation({
            id: 'url-location',
            locator: normalized,
            coordinates: coords,
            precision: normalized.length as LocatorPrecision,
            label: 'Geteilter Standort'
          })
          setMapView(coords, 10)
        }
      }
    }
  }, [setSelectedLocation, setMapView])

  const handleMapLocationSelect = useCallback((coords: Coordinates, locator: string) => {
    setSelectedLocation({
      id: 'map-selection',
      locator,
      coordinates: coords,
      precision: locator.length as LocatorPrecision,
      label: 'Karten-Auswahl'
    })
  }, [setSelectedLocation])

  return (
    <MainLayout>
      {(activeTab) => (
        <>
          {activeTab === 'converter' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <AddressSearch />
                <GpsButton />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <ConverterPanel />
                <BatchConverter />
              </div>
              {state.selectedLocation && (
                <SunTimesDisplay coordinates={state.selectedLocation.coordinates} />
              )}
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <GpsButton />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <QRBCalculator />
                <MultiPointCompare />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <Card title={de.map.title}>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <AddressSearch />
                    <GpsButton />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <MapControls />
                  </div>

                  <MapView onLocationSelect={handleMapLocationSelect} />

                  {state.selectedLocation && (
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-slate-500">Locator</span>
                            <div className="font-mono font-bold text-primary-900 text-xl">
                              {state.selectedLocation.locator}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-xs text-slate-500">{de.converter.latitudeInput}</span>
                              <div className="font-mono">
                                {state.selectedLocation.coordinates.latitude.toFixed(6)}°
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatCoordinate(state.selectedLocation.coordinates.latitude, 'latitude', 'dms')}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">{de.converter.longitudeInput}</span>
                              <div className="font-mono">
                                {state.selectedLocation.coordinates.longitude.toFixed(6)}°
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatCoordinate(state.selectedLocation.coordinates.longitude, 'longitude', 'dms')}
                              </div>
                            </div>
                          </div>
                          {state.selectedLocation.label && state.selectedLocation.label !== 'Karten-Auswahl' && (
                            <div className="text-xs text-slate-600 mt-1">
                              {state.selectedLocation.label}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopy(state.selectedLocation!.locator, 'map-locator')}
                          >
                            {copied === 'map-locator' ? de.converter.copied : 'Locator kopieren'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopy(
                              `${state.selectedLocation!.coordinates.latitude.toFixed(6)}, ${state.selectedLocation!.coordinates.longitude.toFixed(6)}`,
                              'map-coords'
                            )}
                          >
                            {copied === 'map-coords' ? de.converter.copied : 'Koordinaten kopieren'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {state.selectedLocation && (
                <SunTimesDisplay coordinates={state.selectedLocation.coordinates} />
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <FavoritesList />
            </div>
          )}
        </>
      )}
    </MainLayout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
