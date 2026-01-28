import { useState, useCallback } from 'react'
import { Card, Button, Select, Tabs, TabList, Tab, TabPanel } from '@/components/common'
import { LocatorInput } from './LocatorInput'
import { CoordinateInput } from './CoordinateInput'
import { de } from '@/i18n/de'
import { useLocator } from '@/hooks'
import { useAppContext } from '@/store'
import type { LocatorPrecision } from '@/types'
import { formatCoordinate } from '@/utils/validation'

export function ConverterPanel() {
  const { setSelectedLocation, setMapView } = useAppContext()
  const locatorState = useLocator()
  const [precision, setPrecision] = useState<LocatorPrecision>(6)
  const [latInput, setLatInput] = useState('')
  const [lonInput, setLonInput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCoordsConvert = useCallback(() => {
    const lat = parseFloat(latInput)
    const lon = parseFloat(lonInput)

    if (!isNaN(lat) && !isNaN(lon)) {
      locatorState.setCoordinates({ latitude: lat, longitude: lon }, precision)
    }
  }, [latInput, lonInput, precision, locatorState])

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback für ältere Browser
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  const handleShowOnMap = useCallback(() => {
    if (locatorState.coordinates) {
      const location = locatorState.toLocation()
      if (location) {
        setSelectedLocation(location)
        setMapView(location.coordinates, 12)
      }
    }
  }, [locatorState, setSelectedLocation, setMapView])

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
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{de.converter.result}</span>
                <span className="text-xs text-slate-500">
                  {locatorState.precision}-stellig
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{de.converter.latitudeInput}</div>
                  <div className="font-mono text-lg">{locatorState.coordinates.latitude.toFixed(6)}</div>
                  <div className="text-sm text-slate-500">
                    {formatCoordinate(locatorState.coordinates.latitude, 'latitude', 'dms')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{de.converter.longitudeInput}</div>
                  <div className="font-mono text-lg">{locatorState.coordinates.longitude.toFixed(6)}</div>
                  <div className="text-sm text-slate-500">
                    {formatCoordinate(locatorState.coordinates.longitude, 'longitude', 'dms')}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(`${locatorState.coordinates!.latitude}, ${locatorState.coordinates!.longitude}`)}
                >
                  {copied ? de.converter.copied : de.converter.copy}
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

          <Select
            label={de.converter.precision}
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value) as LocatorPrecision)}
            options={[
              { value: 4, label: '4-stellig (Square)' },
              { value: 6, label: '6-stellig (Subsquare)' },
              { value: 8, label: '8-stellig (Extended)' },
              { value: 10, label: '10-stellig (Extended Subsquare)' }
            ]}
          />

          <Button onClick={handleCoordsConvert} className="w-full">
            {de.converter.convert}
          </Button>

          {locatorState.locator && !locatorState.error && latInput && lonInput && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="text-sm text-slate-600">{de.converter.result}</div>
              <div className="font-mono text-2xl text-primary-600 font-bold tracking-wider">
                {locatorState.locator}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(locatorState.locator)}
                >
                  {copied ? de.converter.copied : de.converter.copy}
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
      </Tabs>
    </Card>
  )
}
