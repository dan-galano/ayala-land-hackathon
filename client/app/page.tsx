// client/app/page.tsx
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { KpiSection } from '@/components/kpi/KpiSection'
import { AnomalyPanel } from '@/components/AnomalyPanel'
import type { Unit, Summary } from '@/lib/types'

const API_BASE = 'http://localhost:3001'

export default async function Page() {
  let units: Unit[] = []
  let summary: Summary | null = null
  let anomalies: Unit[] = []

  try {
    const [unitsRes, summaryRes, anomaliesRes] = await Promise.all([
      fetch(`${API_BASE}/api/units`, { cache: 'force-cache' }),
      fetch(`${API_BASE}/api/summary`, { cache: 'force-cache' }),
      fetch(`${API_BASE}/api/anomalies`, { cache: 'force-cache' }),
    ])

    if (!unitsRes.ok) throw new Error(`units: ${unitsRes.status}`)
    if (!summaryRes.ok) throw new Error(`summary: ${summaryRes.status}`)
    if (!anomaliesRes.ok) throw new Error(`anomalies: ${anomaliesRes.status}`)

    ;[units, summary, anomalies] = await Promise.all([
      unitsRes.json() as Promise<Unit[]>,
      summaryRes.json() as Promise<Summary>,
      anomaliesRes.json() as Promise<Unit[]>,
    ])
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Ayala Land — Net-Zero Command Center
      </h1>
      <KpiSection summary={summary} />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <HeatmapGrid units={units} />
        </div>
        <div className="w-80 shrink-0">
          <AnomalyPanel anomalies={anomalies} />
        </div>
      </div>
    </main>
  )
}
