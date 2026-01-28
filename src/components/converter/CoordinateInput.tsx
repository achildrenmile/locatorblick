import { useState } from 'react'
import { Input } from '@/components/common'
import { de } from '@/i18n/de'
import { parseCoordinate } from '@/utils/validation'

interface CoordinateInputProps {
  latitude: string
  longitude: string
  onLatitudeChange: (value: string) => void
  onLongitudeChange: (value: string) => void
  latError?: string | null
  lonError?: string | null
}

export function CoordinateInput({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  latError,
  lonError
}: CoordinateInputProps) {
  const [latInput, setLatInput] = useState(latitude)
  const [lonInput, setLonInput] = useState(longitude)

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLatInput(value)

    // Parsen verschiedener Formate
    const parsed = parseCoordinate(value)
    if (parsed !== null) {
      onLatitudeChange(parsed.toString())
    } else {
      onLatitudeChange(value)
    }
  }

  const handleLonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLonInput(value)

    const parsed = parseCoordinate(value)
    if (parsed !== null) {
      onLongitudeChange(parsed.toString())
    } else {
      onLongitudeChange(value)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label={de.converter.latitudeInput}
        value={latInput}
        onChange={handleLatChange}
        placeholder="z.B. 48.2082"
        error={latError || undefined}
        hint="Dezimal oder DMS"
      />
      <Input
        label={de.converter.longitudeInput}
        value={lonInput}
        onChange={handleLonChange}
        placeholder="z.B. 16.3738"
        error={lonError || undefined}
        hint="Dezimal oder DMS"
      />
    </div>
  )
}
