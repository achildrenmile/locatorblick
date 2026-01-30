import { useState, useCallback } from 'react'
import { Card, Button, Tabs, TabList, Tab, TabPanel } from '@/components/common'
import { LocatorInput } from './LocatorInput'
import { CoordinateInput } from './CoordinateInput'
import { LocatorDisplay, LocatorParts } from './LocatorDisplay'
import { de } from '@/i18n/de'
import { useLocator } from '@/hooks'
import { useAppContext } from '@/store'
import { formatCoordinate } from '@/utils/validation'
import { coordinatesToLocator } from '@/utils/maidenhead'
import type { LocatorPrecision } from '@/types'

export function ConverterPanel() {
  const { setSelectedLocation, setMapView, setActiveTab } = useAppContext()
  const locatorState = useLocator()
  const [latInput, setLatInput] = useState('')
  const [lonInput, setLonInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const handleCoordsConvert = useCallback(() => {
    const lat = parseFloat(latInput)
    const lon = parseFloat(lonInput)

    if (!isNaN(lat) && !isNaN(lon)) {
      locatorState.setCoordinates({ latitude: lat, longitude: lon }, 10)
    }
  }, [latInput, lonInput, locatorState])

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

  const handleShowOnMap = useCallback(() => {
    if (locatorState.coordinates) {
      const location = locatorState.toLocation()
      if (location) {
        setSelectedLocation(location)
        setMapView(location.coordinates, 14)
        setActiveTab('map')
      }
    }
  }, [locatorState, setSelectedLocation, setMapView, setActiveTab])

  const handleShowCoordsOnMap = useCallback(() => {
    const lat = parseFloat(latInput)
    const lon = parseFloat(lonInput)
    if (!isNaN(lat) && !isNaN(lon)) {
      const coords = { latitude: lat, longitude: lon }
      const locator = coordinatesToLocator(coords, 6)
      if (locator) {
        setSelectedLocation({
          id: 'coords-conversion',
          locator,
          coordinates: coords,
          precision: 6 as LocatorPrecision,
          label: 'Koordinaten-Eingabe'
        })
        setMapView(coords, 14)
        setActiveTab('map')
      }
    }
  }, [latInput, lonInput, setSelectedLocation, setMapView, setActiveTab])

  // Parse coordinates for display
  const parsedCoords = latInput && lonInput ? {
    latitude: parseFloat(latInput),
    longitude: parseFloat(lonInput)
  } : null
  const coordsValid = parsedCoords &&
    !isNaN(parsedCoords.latitude) &&
    !isNaN(parsedCoords.longitude) &&
    parsedCoords.latitude >= -90 && parsedCoords.latitude <= 90 &&
    parsedCoords.longitude >= -180 && parsedCoords.longitude <= 180

  return (
    <Card title={de.converter.title}>
      <Tabs defaultTab="locator-to-coords">
        <TabList className="mb-4">
          <Tab value="locator-to-coords">{de.converter.locatorToCoords}</Tab>
          <Tab value="coords-to-locator">{de.converter.coordsToLocator}</Tab>
        </TabList>

        <TabPanel value="locator-to-coords" className="space-y-4">
          <LocatorInput
            value={locatorState.locator}
            onChange={locatorState.setLocator}
            error={locatorState.error}
            autoFocus
          />

          {locatorState.coordinates && (
            <div className="space-y-4">
              {/* Locator mit farbigen Teilen */}
              <div className="p-4 bg-gradient-to-r from-primary-50 to-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-2">Locator</div>
                <LocatorParts locator={locatorState.locator} className="text-2xl font-bold" />
                <div className="text-xs text-slate-400 mt-1">
                  {locatorState.precision}-stellig
                </div>
              </div>

              {/* Koordinaten */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-2">{de.converter.result}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">{de.converter.latitudeInput}</div>
                    <div className="font-mono text-lg font-semibold">
                      {locatorState.coordinates.latitude.toFixed(6)}°
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatCoordinate(locatorState.coordinates.latitude, 'latitude', 'dms')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{de.converter.longitudeInput}</div>
                    <div className="font-mono text-lg font-semibold">
                      {locatorState.coordinates.longitude.toFixed(6)}°
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatCoordinate(locatorState.coordinates.longitude, 'longitude', 'dms')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(locatorState.locator, 'locator')}
                >
                  {copied === 'locator' ? de.converter.copied : 'Locator kopieren'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(
                    `${locatorState.coordinates!.latitude.toFixed(6)}, ${locatorState.coordinates!.longitude.toFixed(6)}`,
                    'coords'
                  )}
                >
                  {copied === 'coords' ? de.converter.copied : 'Koordinaten kopieren'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowOnMap}
                >
                  {de.converter.showOnMap}
                </Button>
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel value="coords-to-locator" className="space-y-4">
          <CoordinateInput
            latitude={latInput}
            longitude={lonInput}
            onLatitudeChange={setLatInput}
            onLongitudeChange={setLonInput}
          />

          <Button onClick={handleCoordsConvert} className="w-full">
            {de.converter.convert}
          </Button>

          {coordsValid && (
            <div className="space-y-4">
              {/* Alle Genauigkeitsstufen anzeigen */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm font-medium text-slate-700 mb-3">
                  Alle Genauigkeitsstufen
                </div>
                <LocatorDisplay
                  coordinates={parsedCoords!}
                  highlightPrecision={10}
                />
              </div>

              {/* Höchste Genauigkeit prominent */}
              <div className="p-4 bg-gradient-to-r from-primary-50 to-slate-50 rounded-lg">
                <div className="text-xs text-slate-500 mb-2">Maximale Genauigkeit (10-stellig)</div>
                <LocatorParts
                  locator={coordinatesToLocator(parsedCoords!, 10) || ''}
                  className="text-2xl font-bold"
                />
                <div className="text-xs text-slate-400 mt-1">
                  ca. 19m × 19m Auflösung
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(coordinatesToLocator(parsedCoords!, 10) || '', 'loc10')}
                >
                  {copied === 'loc10' ? de.converter.copied : '10-stellig kopieren'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(coordinatesToLocator(parsedCoords!, 6) || '', 'loc6')}
                >
                  {copied === 'loc6' ? de.converter.copied : '6-stellig kopieren'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowCoordsOnMap}
                >
                  {de.converter.showOnMap}
                </Button>
              </div>
            </div>
          )}
        </TabPanel>
      </Tabs>
    </Card>
  )
}
