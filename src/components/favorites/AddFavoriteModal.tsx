import { useState } from 'react'
import { Modal, Button, Input, Select } from '@/components/common'
import { LocatorInput } from '@/components/converter'
import { de } from '@/i18n/de'
import { useLocator, useFavorites } from '@/hooks'
import type { FavoriteCategory } from '@/types'

interface AddFavoriteModalProps {
  isOpen: boolean
  onClose: () => void
  initialLocator?: string
}

const categoryOptions = [
  { value: 'home', label: de.favorites.categories.home },
  { value: 'portable', label: de.favorites.categories.portable },
  { value: 'repeater', label: de.favorites.categories.repeater },
  { value: 'dx', label: de.favorites.categories.dx },
  { value: 'contest', label: de.favorites.categories.contest },
  { value: 'other', label: de.favorites.categories.other }
]

export function AddFavoriteModal({ isOpen, onClose, initialLocator }: AddFavoriteModalProps) {
  const locatorState = useLocator(initialLocator)
  const { addFavorite } = useFavorites()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<FavoriteCategory>('other')
  const [isHome, setIsHome] = useState(false)

  const handleSave = () => {
    const location = locatorState.toLocation()
    if (!location || !name.trim()) return

    addFavorite(location, name.trim(), category, isHome)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setCategory('other')
    setIsHome(false)
    locatorState.clear()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={de.favorites.add}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={!locatorState.coordinates || !name.trim()}
          >
            Speichern
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={de.favorites.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Mein QTH"
          autoFocus
        />

        <LocatorInput
          value={locatorState.locator}
          onChange={locatorState.setLocator}
          error={locatorState.error}
        />

        {locatorState.coordinates && (
          <div className="text-sm text-slate-500">
            {locatorState.coordinates.latitude.toFixed(4)}, {locatorState.coordinates.longitude.toFixed(4)}
          </div>
        )}

        <Select
          label={de.favorites.category}
          value={category}
          onChange={(e) => setCategory(e.target.value as FavoriteCategory)}
          options={categoryOptions}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isHome}
            onChange={(e) => setIsHome(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm">{de.favorites.setAsHome}</span>
        </label>
      </div>
    </Modal>
  )
}
