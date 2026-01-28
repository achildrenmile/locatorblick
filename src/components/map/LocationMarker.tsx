import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Coordinates } from '@/types'

// Custom Icons
const createIcon = (color: 'blue' | 'red' | 'green' | 'orange') => {
  const colors = {
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#10b981',
    orange: '#f59e0b'
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${colors[color]}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  })
}

interface LocationMarkerProps {
  position: Coordinates
  locator: string
  label?: string
  color?: 'blue' | 'red' | 'green' | 'orange'
}

export function LocationMarker({
  position,
  locator,
  label,
  color = 'blue'
}: LocationMarkerProps) {
  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={createIcon(color)}
    >
      <Popup>
        <div className="text-sm">
          {label && <div className="font-semibold mb-1">{label}</div>}
          <div className="font-mono text-primary-600 text-lg font-bold">{locator}</div>
          <div className="text-slate-500 mt-1">
            {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
