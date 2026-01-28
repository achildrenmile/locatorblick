import { useEffect, useCallback, useState } from 'react'
import { AppProvider, useAppContext } from '@/store'
import { MainLayout } from '@/components/layout'
import { ConverterPanel, BatchConverter } from '@/components/converter'
import { QRBCalculator, MultiPointCompare } from '@/components/calculator'
import { MapView, MapControls } from '@/components/map'
import { FavoritesList } from '@/components/favorites'
import { GpsButton } from '@/components/location'
import { SunTimesDisplay } from '@/components/sun'
import { Card } from '@/components/common'
import { de } from '@/i18n/de'
import { locatorToCoordinates, normalizeLocator } from '@/utils/maidenhead'
import type { Coordinates, LocatorPrecision } from '@/types'

function AppContent() {
  const { state, setSelectedLocation, setMapView } = useAppContext()
  const [clickedLocator, setClickedLocator] = useState<string | null>(null)

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
    setClickedLocator(locator)
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
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <MapControls />
                    <GpsButton />
                  </div>

                  <MapView onLocationSelect={handleMapLocationSelect} />

                  {clickedLocator && (
                    <div className="p-3 bg-primary-50 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-sm text-primary-700">{de.map.clickToSelect}:</span>
                        <span className="ml-2 font-mono font-bold text-primary-900 text-lg">
                          {clickedLocator}
                        </span>
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
