import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { Location, Coordinates, CalculationResult, LocatorPrecision } from '@/types'

interface AppState {
  currentLocation: Location | null
  selectedLocation: Location | null
  calculationResult: CalculationResult | null
  mapCenter: Coordinates
  mapZoom: number
  showGrid: boolean
  gridLevel: 2 | 4 | 6
  defaultPrecision: LocatorPrecision
}

type AppAction =
  | { type: 'SET_CURRENT_LOCATION'; payload: Location | null }
  | { type: 'SET_SELECTED_LOCATION'; payload: Location | null }
  | { type: 'SET_CALCULATION_RESULT'; payload: CalculationResult | null }
  | { type: 'SET_MAP_CENTER'; payload: Coordinates }
  | { type: 'SET_MAP_ZOOM'; payload: number }
  | { type: 'SET_SHOW_GRID'; payload: boolean }
  | { type: 'SET_GRID_LEVEL'; payload: 2 | 4 | 6 }
  | { type: 'SET_DEFAULT_PRECISION'; payload: LocatorPrecision }

const initialState: AppState = {
  currentLocation: null,
  selectedLocation: null,
  calculationResult: null,
  mapCenter: { latitude: 48.2, longitude: 16.37 }, // Wien als Standard
  mapZoom: 6,
  showGrid: true,
  gridLevel: 4,
  defaultPrecision: 6
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload }
    case 'SET_SELECTED_LOCATION':
      return { ...state, selectedLocation: action.payload }
    case 'SET_CALCULATION_RESULT':
      return { ...state, calculationResult: action.payload }
    case 'SET_MAP_CENTER':
      return { ...state, mapCenter: action.payload }
    case 'SET_MAP_ZOOM':
      return { ...state, mapZoom: action.payload }
    case 'SET_SHOW_GRID':
      return { ...state, showGrid: action.payload }
    case 'SET_GRID_LEVEL':
      return { ...state, gridLevel: action.payload }
    case 'SET_DEFAULT_PRECISION':
      return { ...state, defaultPrecision: action.payload }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  setCurrentLocation: (location: Location | null) => void
  setSelectedLocation: (location: Location | null) => void
  setCalculationResult: (result: CalculationResult | null) => void
  setMapView: (center: Coordinates, zoom?: number) => void
  toggleGrid: () => void
  setGridLevel: (level: 2 | 4 | 6) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setCurrentLocation = (location: Location | null) => {
    dispatch({ type: 'SET_CURRENT_LOCATION', payload: location })
  }

  const setSelectedLocation = (location: Location | null) => {
    dispatch({ type: 'SET_SELECTED_LOCATION', payload: location })
  }

  const setCalculationResult = (result: CalculationResult | null) => {
    dispatch({ type: 'SET_CALCULATION_RESULT', payload: result })
  }

  const setMapView = (center: Coordinates, zoom?: number) => {
    dispatch({ type: 'SET_MAP_CENTER', payload: center })
    if (zoom !== undefined) {
      dispatch({ type: 'SET_MAP_ZOOM', payload: zoom })
    }
  }

  const toggleGrid = () => {
    dispatch({ type: 'SET_SHOW_GRID', payload: !state.showGrid })
  }

  const setGridLevel = (level: 2 | 4 | 6) => {
    dispatch({ type: 'SET_GRID_LEVEL', payload: level })
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setCurrentLocation,
        setSelectedLocation,
        setCalculationResult,
        setMapView,
        toggleGrid,
        setGridLevel
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
