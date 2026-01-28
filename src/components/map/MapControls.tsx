import { Button, Select } from '@/components/common'
import { useAppContext } from '@/store'
import { de } from '@/i18n/de'

export function MapControls() {
  const { state, toggleGrid, setGridLevel } = useAppContext()

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Button
        variant={state.showGrid ? 'primary' : 'secondary'}
        size="sm"
        onClick={toggleGrid}
      >
        {de.map.showGrid}
      </Button>

      {state.showGrid && (
        <Select
          value={state.gridLevel}
          onChange={(e) => setGridLevel(parseInt(e.target.value) as 2 | 4 | 6)}
          options={[
            { value: 2, label: de.map.fields },
            { value: 4, label: de.map.squares },
            { value: 6, label: de.map.subsquares }
          ]}
          className="w-auto"
        />
      )}
    </div>
  )
}
