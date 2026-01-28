import { Button } from '@/components/common'
import { de } from '@/i18n/de'
import { useAppContext } from '@/store'
import type { Favorite } from '@/types'

interface FavoriteItemProps {
  favorite: Favorite
  onDelete: () => void
  onSetHome: () => void
}

const categoryColors: Record<string, string> = {
  home: 'bg-blue-100 text-blue-700',
  portable: 'bg-green-100 text-green-700',
  repeater: 'bg-purple-100 text-purple-700',
  dx: 'bg-orange-100 text-orange-700',
  contest: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-700'
}

export function FavoriteItem({ favorite, onDelete, onSetHome }: FavoriteItemProps) {
  const { setSelectedLocation, setMapView } = useAppContext()

  const handleShowOnMap = () => {
    setSelectedLocation(favorite)
    setMapView(favorite.coordinates, 10)
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-3">
        {favorite.isHomeQth && (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{favorite.name}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[favorite.category]}`}>
              {de.favorites.categories[favorite.category as keyof typeof de.favorites.categories]}
            </span>
          </div>
          <div className="text-sm text-slate-500 font-mono">{favorite.locator}</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleShowOnMap} title="Auf Karte zeigen">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </Button>
        {!favorite.isHomeQth && (
          <Button variant="ghost" size="sm" onClick={onSetHome} title="Als Home-QTH setzen">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete} title="Löschen">
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
