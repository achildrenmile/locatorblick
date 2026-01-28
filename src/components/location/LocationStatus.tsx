import { useAppContext } from '@/store'
import { de } from '@/i18n/de'

export function LocationStatus() {
  const { state } = useAppContext()

  if (!state.currentLocation) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm text-green-700">
        {de.location.gpsActive}
      </span>
      <span className="font-mono text-green-800 font-bold">
        {state.currentLocation.locator}
      </span>
    </div>
  )
}
