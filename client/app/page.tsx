import { HeatmapGrid } from '@/components/HeatmapGrid'
import type { Unit } from '@/lib/types'

export default async function Page() {
  let units: Unit[] = []

  try {
    const res = await fetch('http://localhost:3001/api/units', {
      cache: 'force-cache',
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    units = await res.json()
  } catch (err) {
    console.error('Failed to fetch units from Express API:', err)
    // Render empty grid gracefully — don't crash the page
  }

  return (
    <main className="p-6">
      <HeatmapGrid units={units} />
    </main>
  )
}
