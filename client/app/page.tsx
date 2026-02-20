import { KpiSection } from "@/components/kpi/KpiSection"

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Avida Towers Vita — Net-Zero Command Center
      </h1>
      <KpiSection />
    </main>
  )
}
