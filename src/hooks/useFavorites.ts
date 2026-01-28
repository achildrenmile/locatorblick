import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Favorite, FavoriteCategory, Location } from '@/types'

interface UseFavoritesResult {
  favorites: Favorite[]
  homeQth: Favorite | null
  addFavorite: (location: Location, name: string, category: FavoriteCategory, isHome?: boolean) => void
  updateFavorite: (id: string, updates: Partial<Omit<Favorite, 'id' | 'createdAt'>>) => void
  removeFavorite: (id: string) => void
  setHomeQth: (id: string) => void
  getFavoritesByCategory: (category: FavoriteCategory) => Favorite[]
  importFavorites: (data: Favorite[]) => void
  exportFavorites: () => string
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('locatorblick-favorites', [])

  const homeQth = useMemo(() => {
    return favorites.find(f => f.isHomeQth) || null
  }, [favorites])

  const addFavorite = useCallback((
    location: Location,
    name: string,
    category: FavoriteCategory,
    isHome = false
  ) => {
    const newFavorite: Favorite = {
      ...location,
      id: crypto.randomUUID(),
      name,
      category,
      isHomeQth: isHome,
      createdAt: Date.now()
    }

    setFavorites(prev => {
      // Wenn neuer Favorit Home-QTH ist, bei allen anderen entfernen
      if (isHome) {
        return [...prev.map(f => ({ ...f, isHomeQth: false })), newFavorite]
      }
      return [...prev, newFavorite]
    })
  }, [setFavorites])

  const updateFavorite = useCallback((
    id: string,
    updates: Partial<Omit<Favorite, 'id' | 'createdAt'>>
  ) => {
    setFavorites(prev => prev.map(f => {
      if (f.id !== id) {
        // Wenn ein anderer als Home gesetzt wird, diesen auf false setzen
        if (updates.isHomeQth) {
          return { ...f, isHomeQth: false }
        }
        return f
      }
      return { ...f, ...updates }
    }))
  }, [setFavorites])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }, [setFavorites])

  const setHomeQth = useCallback((id: string) => {
    setFavorites(prev => prev.map(f => ({
      ...f,
      isHomeQth: f.id === id
    })))
  }, [setFavorites])

  const getFavoritesByCategory = useCallback((category: FavoriteCategory) => {
    return favorites.filter(f => f.category === category)
  }, [favorites])

  const importFavorites = useCallback((data: Favorite[]) => {
    // Validieren und IDs neu generieren
    const imported = data.map(f => ({
      ...f,
      id: crypto.randomUUID(),
      createdAt: f.createdAt || Date.now()
    }))

    // Nur einen Home-QTH behalten
    let hasHome = false
    const cleaned = imported.map(f => {
      if (f.isHomeQth) {
        if (hasHome) {
          return { ...f, isHomeQth: false }
        }
        hasHome = true
      }
      return f
    })

    setFavorites(prev => [...prev, ...cleaned])
  }, [setFavorites])

  const exportFavorites = useCallback(() => {
    return JSON.stringify(favorites, null, 2)
  }, [favorites])

  return {
    favorites,
    homeQth,
    addFavorite,
    updateFavorite,
    removeFavorite,
    setHomeQth,
    getFavoritesByCategory,
    importFavorites,
    exportFavorites
  }
}
