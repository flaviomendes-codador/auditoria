interface StatCardProps { value: number; label: string; color: string }

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="rounded-md border border-surface-border bg-surface-card p-3.5 text-center shadow-subtle">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-[0.68rem] font-medium text-text-secondary">{label}</div>
    </div>
  )
}

export function StatsRow({ confirmed, pending, cancelled }: { confirmed: number; pending: number; cancelled: number }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard value={confirmed} label="Confirmados" color="text-emerald-500" />
      <StatCard value={pending} label="Pendentes" color="text-amber-500" />
      <StatCard value={cancelled} label="Cancelados" color="text-red-500" />
    </div>
  )
}
