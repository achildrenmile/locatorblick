import { useMemo } from 'react'
import { coordinatesToLocator } from '@/utils/maidenhead'
import type { Coordinates, LocatorPrecision } from '@/types'

interface LocatorDisplayProps {
  coordinates: Coordinates
  highlightPrecision?: LocatorPrecision
}

interface PrecisionLevel {
  precision: LocatorPrecision
  label: string
  description: string
}

const precisionLevels: PrecisionLevel[] = [
  { precision: 4, label: 'Field/Square', description: '~111 km' },
  { precision: 6, label: 'Subsquare', description: '~4.6 km' },
  { precision: 8, label: 'Extended', description: '~463 m' },
  { precision: 10, label: 'Ext. Subsquare', description: '~19 m' }
]

export function LocatorDisplay({ coordinates, highlightPrecision }: LocatorDisplayProps) {
  const locators = useMemo(() => {
    return precisionLevels.map(level => ({
      ...level,
      locator: coordinatesToLocator(coordinates, level.precision) || ''
    }))
  }, [coordinates])

  return (
    <div className="space-y-2">
      {locators.map(({ precision, label, description, locator }) => (
        <div
          key={precision}
          className={`
            flex items-center justify-between p-2 rounded-lg transition-colors
            ${highlightPrecision === precision
              ? 'bg-primary-100 border border-primary-300'
              : 'bg-slate-50 hover:bg-slate-100'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`
              font-mono text-lg font-bold tracking-wider
              ${highlightPrecision === precision ? 'text-primary-700' : 'text-slate-800'}
            `}>
              {formatLocatorWithSpaces(locator)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-slate-600">{label}</div>
            <div className="text-xs text-slate-400">{description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Formatiert einen Locator mit Leerzeichen für bessere Lesbarkeit
 * z.B. "JN77TT14po" -> "JN77 TT 14 po"
 */
export function formatLocatorWithSpaces(locator: string): string {
  if (!locator) return ''

  const parts: string[] = []

  // Field + Square (4 chars)
  if (locator.length >= 4) {
    parts.push(locator.slice(0, 4))
  } else if (locator.length >= 2) {
    parts.push(locator.slice(0, 2))
    return parts.join(' ')
  }

  // Subsquare (2 chars)
  if (locator.length >= 6) {
    parts.push(locator.slice(4, 6))
  }

  // Extended Square (2 chars)
  if (locator.length >= 8) {
    parts.push(locator.slice(6, 8))
  }

  // Extended Subsquare (2 chars)
  if (locator.length >= 10) {
    parts.push(locator.slice(8, 10))
  }

  return parts.join(' ')
}

/**
 * Kompakte Anzeige eines einzelnen Locators mit farblicher Hervorhebung der Teile
 */
interface LocatorPartsProps {
  locator: string
  className?: string
}

export function LocatorParts({ locator, className = '' }: LocatorPartsProps) {
  if (!locator) return null

  const parts = [
    { text: locator.slice(0, 2), color: 'text-blue-600', label: 'Field' },
    { text: locator.slice(2, 4), color: 'text-green-600', label: 'Square' },
    { text: locator.slice(4, 6), color: 'text-amber-600', label: 'Subsquare' },
    { text: locator.slice(6, 8), color: 'text-purple-600', label: 'Ext.Sq' },
    { text: locator.slice(8, 10), color: 'text-red-600', label: 'Ext.Sub' }
  ].filter(p => p.text)

  return (
    <div className={`font-mono ${className}`}>
      {parts.map((part, index) => (
        <span key={index} className={part.color} title={part.label}>
          {part.text}
          {index < parts.length - 1 && <span className="text-slate-300 mx-0.5"> </span>}
        </span>
      ))}
    </div>
  )
}
