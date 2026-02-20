"use client"

import { useEffect, useState } from "react"
import type { Summary } from "@/lib/types"
import { fetchSummary } from "@/lib/api"
import { KpiCard } from "./KpiCard"
import { SbtiIndicator } from "./SbtiIndicator"
import { SptProgressBar } from "./SptProgressBar"

export function KpiSection() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary()
      .then(setSummary)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
        Failed to load KPI data: {error}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-slate-500 text-sm">Loading KPI data...</div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Total Consumption"
          value={`${summary.totalKwh.toLocaleString()} kWh`}
        />
        <KpiCard
          title="Scope 3 Tenant Emissions"
          value={`${summary.totalCo2e.toLocaleString()} kg CO₂e`}
        />
        <KpiCard
          title="Units Over Threshold"
          value={`${summary.unitsOverThreshold}`}
          subtitle={`of ${summary.unitCount} total units`}
        />
        <KpiCard
          title="Energy Savings vs Baseline"
          value={`${summary.savingsPercent.toFixed(1)}%`}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SbtiIndicator
          progress={summary.sbtiProgress}
          savingsPercent={summary.savingsPercent}
        />
        <SptProgressBar
          progress={summary.sptProgress}
          savingsPercent={summary.savingsPercent}
        />
      </div>
    </section>
  )
}
