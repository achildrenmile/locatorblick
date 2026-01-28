import { useState, useCallback } from 'react'
import { Card, Button } from '@/components/common'
import { de } from '@/i18n/de'
import { locatorToCoordinates, normalizeLocator, coordinatesToLocator } from '@/utils/maidenhead'
import type { LocatorPrecision } from '@/types'

interface ConversionResult {
  input: string
  locator?: string
  latitude?: number
  longitude?: number
  error?: string
}

export function BatchConverter() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<ConversionResult[]>([])
  const [mode, setMode] = useState<'locator' | 'coords'>('locator')

  const handleConvert = useCallback(() => {
    const lines = input.split('\n').filter(line => line.trim())
    const newResults: ConversionResult[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      if (mode === 'locator') {
        // Locator zu Koordinaten
        const normalized = normalizeLocator(trimmed)
        if (normalized) {
          const coords = locatorToCoordinates(normalized)
          if (coords) {
            newResults.push({
              input: trimmed,
              locator: normalized,
              latitude: coords.latitude,
              longitude: coords.longitude
            })
          } else {
            newResults.push({ input: trimmed, error: 'Konvertierung fehlgeschlagen' })
          }
        } else {
          newResults.push({ input: trimmed, error: de.validation.invalidLocator })
        }
      } else {
        // Koordinaten zu Locator
        const parts = trimmed.split(/[,;\s]+/)
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0])
          const lon = parseFloat(parts[1])
          if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            const locator = coordinatesToLocator({ latitude: lat, longitude: lon }, 6 as LocatorPrecision)
            if (locator) {
              newResults.push({
                input: trimmed,
                locator,
                latitude: lat,
                longitude: lon
              })
            } else {
              newResults.push({ input: trimmed, error: 'Konvertierung fehlgeschlagen' })
            }
          } else {
            newResults.push({ input: trimmed, error: 'Ungültige Koordinaten' })
          }
        } else {
          newResults.push({ input: trimmed, error: 'Format: lat, lon' })
        }
      }
    }

    setResults(newResults)
  }, [input, mode])

  const handleExportCsv = useCallback(() => {
    const validResults = results.filter(r => !r.error)
    const csv = [
      mode === 'locator'
        ? 'Locator,Breitengrad,Längengrad'
        : 'Eingabe,Locator,Breitengrad,Längengrad',
      ...validResults.map(r =>
        mode === 'locator'
          ? `${r.locator},${r.latitude},${r.longitude}`
          : `"${r.input}",${r.locator},${r.latitude},${r.longitude}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'locator-export.csv'
    link.click()
  }, [results, mode])

  return (
    <Card title={de.converter.batchTitle}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={mode === 'locator' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('locator')}
          >
            Locator zu Koordinaten
          </Button>
          <Button
            variant={mode === 'coords' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('coords')}
          >
            Koordinaten zu Locator
          </Button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'locator'
            ? 'Ein Locator pro Zeile:\nJN77TT\nJO40LE\nIO91WM'
            : 'Ein Koordinatenpaar pro Zeile:\n48.2082, 16.3738\n50.1109, 8.6821'
          }
          className="w-full h-40 p-3 font-mono text-sm border border-slate-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />

        <div className="flex gap-2">
          <Button onClick={handleConvert}>
            {de.converter.batchConvert}
          </Button>
          {results.length > 0 && (
            <Button variant="secondary" onClick={handleExportCsv}>
              CSV exportieren
            </Button>
          )}
        </div>

        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Eingabe</th>
                  <th className="text-left py-2 px-2">Locator</th>
                  <th className="text-right py-2 px-2">Breitengrad</th>
                  <th className="text-right py-2 px-2">Längengrad</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={result.error ? 'text-red-600' : ''}>
                    <td className="py-2 px-2 font-mono">{result.input}</td>
                    <td className="py-2 px-2 font-mono">{result.locator || '-'}</td>
                    <td className="py-2 px-2 text-right font-mono">
                      {result.latitude?.toFixed(4) || result.error}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {result.longitude?.toFixed(4) || '-'}
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
