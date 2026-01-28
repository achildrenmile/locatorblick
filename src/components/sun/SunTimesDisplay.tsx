import SunCalc from 'suncalc'
import { Card } from '@/components/common'
import { de } from '@/i18n/de'
import type { Coordinates } from '@/types'

interface SunTimesDisplayProps {
  coordinates: Coordinates
  date?: Date
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function SunTimesDisplay({ coordinates, date = new Date() }: SunTimesDisplayProps) {
  const times = SunCalc.getTimes(date, coordinates.latitude, coordinates.longitude)

  const sunItems = [
    { label: de.sun.dawn, time: times.dawn, icon: '🌅' },
    { label: de.sun.sunrise, time: times.sunrise, icon: '☀️' },
    { label: de.sun.solarNoon, time: times.solarNoon, icon: '🌞' },
    { label: de.sun.sunset, time: times.sunset, icon: '🌇' },
    { label: de.sun.dusk, time: times.dusk, icon: '🌆' }
  ]

  return (
    <Card title={de.sun.title}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {sunItems.map((item, index) => (
          <div key={index} className="text-center p-2">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs text-slate-500 mb-1">{item.label}</div>
            <div className="font-mono font-semibold">
              {isNaN(item.time.getTime()) ? '--:--' : formatTime(item.time)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
