import { Polyline, Tooltip } from 'react-leaflet'
import { greatCirclePath, calculateDistance, calculateBearing, cardinalToGerman } from '@/utils/geodesy'
import type { Coordinates } from '@/types'

interface PathLineProps {
  from: Coordinates
  to: Coordinates
  showLongPath?: boolean
}

export function PathLine({ from, to, showLongPath = false }: PathLineProps) {
  const pathCoords = greatCirclePath(from, to, 100)
  const distance = calculateDistance(from, to)
  const bearing = calculateBearing(from, to)

  // Für die Anzeige den Mittelpunkt finden
  const midIndex = Math.floor(pathCoords.length / 2)
  const midPoint = pathCoords[midIndex]

  return (
    <>
      <Polyline
        positions={pathCoords.map(c => [c.latitude, c.longitude])}
        pathOptions={{
          color: showLongPath ? '#f59e0b' : '#3b82f6',
          weight: 3,
          opacity: 0.8,
          dashArray: showLongPath ? '10, 10' : undefined
        }}
      >
        <Tooltip
          position={[midPoint.latitude, midPoint.longitude]}
          permanent
          direction="center"
          className="path-tooltip"
        >
          <div className="text-xs font-medium">
            <div>{distance.kilometers.toFixed(1)} km</div>
            <div>{bearing.degrees.toFixed(0)}° {cardinalToGerman(bearing.cardinal)}</div>
          </div>
        </Tooltip>
      </Polyline>
    </>
  )
}
