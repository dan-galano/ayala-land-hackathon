interface SbtiIndicatorProps {
  progress: number       // sbtiProgress — % of 42% SBTi target achieved (e.g., 90.7)
  savingsPercent: number // raw savings % (e.g., 38.1)
}

export function SbtiIndicator({ progress, savingsPercent }: SbtiIndicatorProps) {
  const isOnTrack = progress >= 80
  const barPct = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm font-semibold text-white">SBTi Carbon Budget (Ayala 42% Target)</p>
      <p className="text-xs text-slate-400 mt-1">
        Scope 3 Tenant Emissions — annual carbon budget consumed
      </p>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-slate-300">{savingsPercent.toFixed(1)}% CO&#8322; reduction achieved</span>
        <span className={isOnTrack ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
          {isOnTrack ? 'ON TRACK' : 'AT RISK'}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
        <div
          className={`h-2 rounded-full transition-all ${isOnTrack ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Ayala verified SBTi: 42% CO&#8322; reduction by 2030
      </p>
    </div>
  )
}
