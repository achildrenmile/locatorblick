import { useState, useCallback } from 'react'
import { Card, Button } from '@/components/common'
import { LocatorInput } from '@/components/converter'
import { useLocator, useFavorites } from '@/hooks'
import { calculateDistance, calculateBearing, cardinalToGerman } from '@/utils/geodesy'
import { locatorToCoordinates, normalizeLocator } from '@/utils/maidenhead'
import type { Coordinates } from '@/types'

interface CompareResult {
  locator: string
  coordinates: Coordinates
  distance: number
  bearing: number
  cardinal: string
}

export function MultiPointCompare() {
  const { homeQth } = useFavorites()
  const baseLocator = useLocator(homeQth?.locator)
  const [locators, setLocators] = useState<string[]>([''])
  const [results, setResults] = useState<CompareResult[]>([])

  const handleAddLocator = useCallback(() => {
    setLocators(prev => [...prev, ''])
  }, [])

  const handleRemoveLocator = useCallback((index: number) => {
    setLocators(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleLocatorChange = useCallback((index: number, value: string) => {
    setLocators(prev => prev.map((l, i) => i === index ? value : l))
  }, [])

  const handleCalculate = useCallback(() => {
    if (!baseLocator.coordinates) return

    const newResults: CompareResult[] = []

    for (const loc of locators) {
      const normalized = normalizeLocator(loc)
      if (!normalized) continue

      const coords = locatorToCoordinates(normalized)
      if (!coords) continue

      const distance = calculateDistance(baseLocator.coordinates, coords)
      const bearing = calculateBearing(baseLocator.coordinates, coords)

      newResults.push({
        locator: normalized,
        coordinates: coords,
        distance: distance.kilometers,
        bearing: bearing.degrees,
        cardinal: bearing.cardinal
      })
    }

    // Nach Entfernung sortieren
    newResults.sort((a, b) => a.distance - b.distance)
    setResults(newResults)
  }, [baseLocator.coordinates, locators])

  return (
    <Card title="Multi-Punkt-Vergleich">
      <div className="space-y-4">
        <LocatorInput
          value={baseLocator.locator}
          onChange={baseLocator.setLocator}
          error={baseLocator.error}
          label="Basis-Standort"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Zu vergleichende Locatoren
          </label>
          {locators.map((loc, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={loc}
                onChange={(e) => handleLocatorChange(index, e.target.value.toUpperCase())}
                placeholder="z.B. JN77TT"
                className="flex-1 input font-mono"
              />
              {locators.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLocator(index)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={handleAddLocator}>
            + Weiterer Locator
          </Button>
        </div>

        <Button onClick={handleCalculate} disabled={!baseLocator.coordinates}>
          Vergleichen
        </Button>

        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Locator</th>
                  <th className="text-right py-2 px-2">Entfernung</th>
                  <th className="text-right py-2 px-2">Richtung</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-mono font-bold">{result.locator}</td>
                    <td className="py-2 px-2 text-right">{result.distance.toFixed(1)} km</td>
                    <td className="py-2 px-2 text-right">
                      {result.bearing.toFixed(0)}° {cardinalToGerman(result.cardinal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}
