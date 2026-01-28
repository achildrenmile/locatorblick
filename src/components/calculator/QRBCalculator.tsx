import { useState, useCallback } from 'react'
import { Card, Button } from '@/components/common'
import { LocatorInput, LocatorParts } from '@/components/converter'
import { de } from '@/i18n/de'
import { useLocator, useFavorites } from '@/hooks'
import { useAppContext } from '@/store'
import { calculateQrbQtf, cardinalToGerman } from '@/utils/geodesy'
import type { CalculationResult } from '@/types'

export function QRBCalculator() {
  const { setCalculationResult, setMapView } = useAppContext()
  const { homeQth } = useFavorites()
  const fromLocator = useLocator(homeQth?.locator)
  const toLocator = useLocator()
  const [result, setResult] = useState<CalculationResult | null>(null)

  const handleCalculate = useCallback(() => {
    const from = fromLocator.toLocation('Von')
    const to = toLocator.toLocation('Nach')

    if (from && to) {
      const calcResult = calculateQrbQtf(from, to)
      setResult(calcResult)
      setCalculationResult(calcResult)

      // Karte auf beide Punkte zentrieren
      const midLat = (from.coordinates.latitude + to.coordinates.latitude) / 2
      const midLon = (from.coordinates.longitude + to.coordinates.longitude) / 2
      setMapView({ latitude: midLat, longitude: midLon }, 6)
    }
  }, [fromLocator, toLocator, setCalculationResult, setMapView])

  const handleClear = useCallback(() => {
    fromLocator.clear()
    toLocator.clear()
    setResult(null)
    setCalculationResult(null)
  }, [fromLocator, toLocator, setCalculationResult])

  const handleUseHome = useCallback(() => {
    if (homeQth) {
      fromLocator.setLocator(homeQth.locator)
    }
  }, [homeQth, fromLocator])

  return (
    <Card title={de.calculator.title}>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <LocatorInput
                value={fromLocator.locator}
                onChange={fromLocator.setLocator}
                error={fromLocator.error}
                label={de.calculator.from}
              />
            </div>
            {homeQth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseHome}
                title="Home-QTH verwenden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>
            )}
          </div>

          <LocatorInput
            value={toLocator.locator}
            onChange={toLocator.setLocator}
            error={toLocator.error}
            label={de.calculator.to}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCalculate}
            disabled={!fromLocator.coordinates || !toLocator.coordinates}
            className="flex-1"
          >
            {de.calculator.calculate}
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Löschen
          </Button>
        </div>

        {result && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Route Summary */}
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Von</div>
                <LocatorParts locator={result.from.locator} className="text-lg font-bold" />
              </div>
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Nach</div>
                <LocatorParts locator={result.to.locator} className="text-lg font-bold" />
              </div>
            </div>

            {/* Kurzweg */}
            <div className="p-4 bg-primary-50 rounded-lg">
              <h4 className="font-semibold text-primary-900 mb-3">{de.calculator.shortPath}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-primary-700">{de.calculator.distance}</div>
                  <div className="text-2xl font-bold text-primary-900">
                    {result.shortPath.distance.kilometers.toFixed(1)} {de.calculator.kilometers}
                  </div>
                  <div className="text-sm text-primary-600">
                    {result.shortPath.distance.miles.toFixed(1)} {de.calculator.miles} / {result.shortPath.distance.nauticalMiles.toFixed(1)} NM
                  </div>
                </div>
                <div>
                  <div className="text-sm text-primary-700">{de.calculator.bearing}</div>
                  <div className="text-2xl font-bold text-primary-900">
                    {result.shortPath.bearing.degrees.toFixed(0)}°
                  </div>
                  <div className="text-sm text-primary-600">
                    {cardinalToGerman(result.shortPath.bearing.cardinal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Langweg */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-700 mb-3">{de.calculator.longPath}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">{de.calculator.distance}</div>
                  <div className="text-lg font-semibold text-slate-700">
                    {result.longPath.distance.kilometers.toFixed(1)} {de.calculator.kilometers}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">{de.calculator.bearing}</div>
                  <div className="text-lg font-semibold text-slate-700">
                    {result.longPath.bearing.degrees.toFixed(0)}° {cardinalToGerman(result.longPath.bearing.cardinal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
