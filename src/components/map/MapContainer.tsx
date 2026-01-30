import { useEffect, useRef } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useAppContext } from '@/store'
import { GridOverlay } from './GridOverlay'
import { LocationMarker } from './LocationMarker'
import { PathLine } from './PathLine'
import { coordinatesToLocator } from '@/utils/maidenhead'
import type { Coordinates, LocatorPrecision } from '@/types'
import 'leaflet/dist/leaflet.css'

function MapController() {
  const { state } = useAppContext()
  const map = useMap()
  const prevCenter = useRef(state.mapCenter)

  useEffect(() => {
    if (
      prevCenter.current.latitude !== state.mapCenter.latitude ||
      prevCenter.current.longitude !== state.mapCenter.longitude
    ) {
      map.setView([state.mapCenter.latitude, state.mapCenter.longitude], state.mapZoom)
      prevCenter.current = state.mapCenter
    }
  }, [state.mapCenter, state.mapZoom, map])

  return null
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (coords: Coordinates, locator: string) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        const coords = { latitude: e.latlng.lat, longitude: e.latlng.lng }
        // Always use 6-character precision for map clicks (subsquare level)
        const locator = coordinatesToLocator(coords, 6 as LocatorPrecision)
        if (locator) {
          onLocationSelect(coords, locator)
        }
      }
    }
  })

  return null
}

interface MapContainerProps {
  onLocationSelect?: (coords: Coordinates, locator: string) => void
  className?: string
}

export function MapView({ onLocationSelect, className = '' }: MapContainerProps) {
  const { state } = useAppContext()

  return (
    <div className={`h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-slate-200 ${className}`}>
      <LeafletMapContainer
        center={[state.mapCenter.latitude, state.mapCenter.longitude]}
        zoom={state.mapZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="/tiles/{z}/{x}/{y}.png"
        />

        <MapController />
        <MapClickHandler onLocationSelect={onLocationSelect} />

        {state.showGrid && <GridOverlay level={state.gridLevel} />}

        {state.currentLocation && (
          <LocationMarker
            position={state.currentLocation.coordinates}
            locator={state.currentLocation.locator}
            label={state.currentLocation.label || 'Aktueller Standort'}
            color="blue"
          />
        )}

        {state.selectedLocation && (
          <LocationMarker
            position={state.selectedLocation.coordinates}
            locator={state.selectedLocation.locator}
            label={state.selectedLocation.label || 'Ausgewählt'}
            color="red"
          />
        )}

        {state.calculationResult && (
          <PathLine
            from={state.calculationResult.from.coordinates}
            to={state.calculationResult.to.coordinates}
          />
        )}
      </LeafletMapContainer>
    </div>
  )
}
