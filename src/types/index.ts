export interface Coordinates {
  latitude: number
  longitude: number
}

export type LocatorPrecision = 4 | 6 | 8 | 10

export interface Location {
  id: string
  locator: string
  coordinates: Coordinates
  precision: LocatorPrecision
  label?: string
}

export type FavoriteCategory = 'home' | 'portable' | 'repeater' | 'dx' | 'contest' | 'other'

export interface Favorite extends Location {
  name: string
  category: FavoriteCategory
  isHomeQth: boolean
  createdAt: number
}

export interface DistanceResult {
  kilometers: number
  miles: number
  nauticalMiles: number
}

export interface BearingResult {
  degrees: number
  cardinal: string
}

export interface PathResult {
  distance: DistanceResult
  bearing: BearingResult
}

export interface CalculationResult {
  from: Location
  to: Location
  shortPath: PathResult
  longPath: PathResult
}

export interface SunTimes {
  sunrise: Date
  sunset: Date
  solarNoon: Date
  dawn: Date
  dusk: Date
  goldenHour: Date
  goldenHourEnd: Date
}

export interface GridSquare {
  locator: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  center: Coordinates
}
