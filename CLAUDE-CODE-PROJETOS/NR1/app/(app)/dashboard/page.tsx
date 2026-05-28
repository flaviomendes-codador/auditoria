export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visão geral do estado de conformidade NR-1
        </p>
      </div>

      {/* Placeholder — substituído pelo PgrStatusBanner + cards de métricas */}
      <div className="rounded-lg border border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center">
        <p className="text-slate-400 text-sm">
          Dashboard em construção — Semana 3
        </p>
      </div>
    </div>
  )
}
