import { useState } from 'react'
import { Card, Button } from '@/components/common'
import { FavoriteItem } from './FavoriteItem'
import { AddFavoriteModal } from './AddFavoriteModal'
import { de } from '@/i18n/de'
import { useFavorites } from '@/hooks'
import type { FavoriteCategory } from '@/types'

const categories: { id: FavoriteCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'home', label: de.favorites.categories.home },
  { id: 'portable', label: de.favorites.categories.portable },
  { id: 'repeater', label: de.favorites.categories.repeater },
  { id: 'dx', label: de.favorites.categories.dx },
  { id: 'contest', label: de.favorites.categories.contest },
  { id: 'other', label: de.favorites.categories.other }
]

export function FavoritesList() {
  const { favorites, removeFavorite, setHomeQth, exportFavorites, importFavorites } = useFavorites()
  const [selectedCategory, setSelectedCategory] = useState<FavoriteCategory | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredFavorites = selectedCategory === 'all'
    ? favorites
    : favorites.filter(f => f.category === selectedCategory)

  const handleExport = () => {
    const data = exportFavorites()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'locatorblick-favoriten.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          importFavorites(data)
        }
      } catch {
        alert('Fehler beim Importieren der Datei')
      }
    }
    input.click()
  }

  return (
    <>
      <Card
        title={de.favorites.title}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleImport}>
              {de.favorites.import}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              {de.favorites.export}
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              {de.favorites.add}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Kategorie-Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Favoriten-Liste */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {de.favorites.empty}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFavorites.map((favorite) => (
                <FavoriteItem
                  key={favorite.id}
                  favorite={favorite}
                  onDelete={() => removeFavorite(favorite.id)}
                  onSetHome={() => setHomeQth(favorite.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <AddFavoriteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  )
}
