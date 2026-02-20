interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  )
}
