import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppContext } from '@/store'
import { coordinatesToLocator } from '@/utils/maidenhead'

interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type: string
}

interface AddressSearchProps {
  onLocationSelect?: (coords: { latitude: number; longitude: number }, locator: string, label: string) => void
}

export function AddressSearch({ onLocationSelect }: AddressSearchProps) {
  const { setSelectedLocation, setMapView } = useAppContext()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: 'json',
          limit: '5',
          addressdetails: '1'
        }),
        {
          headers: {
            'Accept-Language': 'de'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Suche fehlgeschlagen')
      }

      const data: NominatimResult[] = await response.json()
      setResults(data)
      setShowResults(true)
    } catch {
      setError('Adresssuche fehlgeschlagen')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      searchAddress(value)
    }, 300)
  }, [searchAddress])

  const handleSelectResult = useCallback((result: NominatimResult) => {
    const coords = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }
    // Always use 6-character precision (subsquare level)
    const locator = coordinatesToLocator(coords, 6)

    if (locator) {
      // Shorten the display name for the label
      const labelParts = result.display_name.split(',')
      const shortLabel = labelParts.slice(0, 2).join(',').trim()

      setSelectedLocation({
        id: 'search-result',
        locator,
        coordinates: coords,
        precision: 6,
        label: shortLabel
      })
      setMapView(coords, 14)

      if (onLocationSelect) {
        onLocationSelect(coords, locator, shortLabel)
      }
    }

    setQuery(result.display_name.split(',')[0])
    setShowResults(false)
  }, [setSelectedLocation, setMapView, onLocationSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[200px]">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Adresse suchen..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-slate-900 placeholder-slate-400
            transition-colors focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelectResult(result)}
              className="w-full px-3 py-2 text-left hover:bg-primary-50 transition-colors border-b border-slate-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-slate-900 truncate">
                {result.display_name.split(',')[0]}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {result.display_name.split(',').slice(1, 4).join(',')}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && results.length === 0 && query.length >= 3 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg p-3">
          <p className="text-sm text-slate-500 text-center">Keine Ergebnisse gefunden</p>
        </div>
      )}
    </div>
  )
}
