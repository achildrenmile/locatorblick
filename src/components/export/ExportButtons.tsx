import { useState, useCallback } from 'react'
import { Button } from '@/components/common'
import { de } from '@/i18n/de'
import type { Location, CalculationResult } from '@/types'

interface ExportButtonsProps {
  location?: Location | null
  result?: CalculationResult | null
}

export function ExportButtons({ location, result }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getData = useCallback(() => {
    if (result) {
      return {
        from: {
          locator: result.from.locator,
          latitude: result.from.coordinates.latitude,
          longitude: result.from.coordinates.longitude
        },
        to: {
          locator: result.to.locator,
          latitude: result.to.coordinates.latitude,
          longitude: result.to.coordinates.longitude
        },
        shortPath: {
          distanceKm: result.shortPath.distance.kilometers,
          bearingDegrees: result.shortPath.bearing.degrees
        },
        longPath: {
          distanceKm: result.longPath.distance.kilometers,
          bearingDegrees: result.longPath.bearing.degrees
        }
      }
    }

    if (location) {
      return {
        locator: location.locator,
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        precision: location.precision
      }
    }

    return null
  }, [location, result])

  const handleCopyJson = useCallback(async () => {
    const data = getData()
    if (!data) return

    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = JSON.stringify(data, null, 2)
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [getData])

  const handleDownloadJson = useCallback(() => {
    const data = getData()
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'locator-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [getData])

  const handleDownloadCsv = useCallback(() => {
    const data = getData()
    if (!data) return

    let csv = ''

    if (result) {
      csv = 'Typ,Locator,Breitengrad,Längengrad,Entfernung (km),Peilung (°)\n'
      csv += `Von,${result.from.locator},${result.from.coordinates.latitude},${result.from.coordinates.longitude},,\n`
      csv += `Nach,${result.to.locator},${result.to.coordinates.latitude},${result.to.coordinates.longitude},,\n`
      csv += `Kurzweg,,,,"${result.shortPath.distance.kilometers}",${result.shortPath.bearing.degrees}\n`
      csv += `Langweg,,,,"${result.longPath.distance.kilometers}",${result.longPath.bearing.degrees}\n`
    } else if (location) {
      csv = 'Locator,Breitengrad,Längengrad,Genauigkeit\n'
      csv += `${location.locator},${location.coordinates.latitude},${location.coordinates.longitude},${location.precision}\n`
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'locator-data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [getData, result, location])

  if (!location && !result) return null

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={handleCopyJson}>
        {copied ? de.converter.copied : de.export.copyToClipboard}
      </Button>
      <Button variant="secondary" size="sm" onClick={handleDownloadCsv}>
        {de.export.downloadCsv}
      </Button>
      <Button variant="secondary" size="sm" onClick={handleDownloadJson}>
        {de.export.downloadJson}
      </Button>
    </div>
  )
}
