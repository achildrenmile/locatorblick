import { useState, useEffect } from 'react'
import { Input } from '@/components/common'
import { de } from '@/i18n/de'
import { normalizeLocator } from '@/utils/maidenhead'

interface LocatorInputProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  label?: string
  placeholder?: string
  autoFocus?: boolean
}

export function LocatorInput({
  value,
  onChange,
  error,
  label = de.converter.locatorInput,
  placeholder = de.converter.locatorPlaceholder,
  autoFocus
}: LocatorInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase()
    // Nur gültige Zeichen erlauben (Buchstaben und Ziffern)
    const filtered = input.replace(/[^A-Za-z0-9]/g, '').slice(0, 10)
    setLocalValue(filtered)

    // Auto-Format während der Eingabe
    if (filtered.length >= 2) {
      const normalized = normalizeLocator(filtered)
      if (normalized) {
        onChange(normalized)
      } else {
        onChange(filtered)
      }
    } else {
      onChange(filtered)
    }
  }

  const handleBlur = () => {
    // Beim Verlassen des Feldes normalisieren
    if (localValue) {
      const normalized = normalizeLocator(localValue)
      if (normalized) {
        setLocalValue(normalized)
        onChange(normalized)
      }
    }
  }

  return (
    <Input
      label={label}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      error={error || undefined}
      autoFocus={autoFocus}
      className="font-mono text-lg tracking-wider"
    />
  )
}
