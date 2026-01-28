import { useEffect, useState } from 'react'
import { Rectangle, Tooltip, useMap } from 'react-leaflet'
import { generateGridsForBounds } from '@/utils/maidenhead'
import type { GridSquare } from '@/types'

interface GridOverlayProps {
  level: 2 | 4 | 6
}

export function GridOverlay({ level }: GridOverlayProps) {
  const map = useMap()
  const [grids, setGrids] = useState<GridSquare[]>([])

  useEffect(() => {
    const updateGrids = () => {
      const bounds = map.getBounds()
      const zoom = map.getZoom()

      // Automatische Anpassung der Gitter-Ebene basierend auf Zoom
      let effectiveLevel = level
      if (zoom < 4) effectiveLevel = 2
      else if (zoom < 8 && level > 4) effectiveLevel = 4

      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }

      // Begrenzen der Anzahl der Grids
      const lonSpan = mapBounds.east - mapBounds.west
      const latSpan = mapBounds.north - mapBounds.south

      // Maximale Anzahl Grids pro Dimension
      const maxGrids = 50
      const sizes = { 2: { lon: 20, lat: 10 }, 4: { lon: 2, lat: 1 }, 6: { lon: 2/24, lat: 1/24 } }
      const size = sizes[effectiveLevel]

      const lonGrids = Math.ceil(lonSpan / size.lon)
      const latGrids = Math.ceil(latSpan / size.lat)

      if (lonGrids * latGrids > maxGrids * maxGrids) {
        // Zu viele Grids, auf niedrigere Ebene wechseln
        if (effectiveLevel === 6) effectiveLevel = 4
        else if (effectiveLevel === 4) effectiveLevel = 2
      }

      const newGrids = generateGridsForBounds(mapBounds, effectiveLevel)
      setGrids(newGrids)
    }

    updateGrids()
    map.on('moveend', updateGrids)
    map.on('zoomend', updateGrids)

    return () => {
      map.off('moveend', updateGrids)
      map.off('zoomend', updateGrids)
    }
  }, [map, level])

  const getColor = (locatorLength: number): string => {
    switch (locatorLength) {
      case 2: return '#3b82f6' // blue
      case 4: return '#10b981' // green
      case 6: return '#f59e0b' // amber
      default: return '#6366f1' // indigo
    }
  }

  return (
    <>
      {grids.map((grid) => (
        <Rectangle
          key={grid.locator}
          bounds={[
            [grid.bounds.south, grid.bounds.west],
            [grid.bounds.north, grid.bounds.east]
          ]}
          pathOptions={{
            color: getColor(grid.locator.length),
            weight: grid.locator.length === 2 ? 2 : 1,
            fillOpacity: 0.05,
            opacity: 0.6
          }}
        >
          <Tooltip
            direction="center"
            permanent={grid.locator.length <= 4}
            className="grid-tooltip"
          >
            <span className="font-mono font-bold">{grid.locator}</span>
          </Tooltip>
        </Rectangle>
      ))}
    </>
  )
}
