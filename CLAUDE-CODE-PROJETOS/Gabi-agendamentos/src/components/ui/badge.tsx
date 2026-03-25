import type { AppointmentStatus } from '@/lib/supabase/types'

const statusConfig: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmado' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pendente' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelado' },
  rescheduling: { bg: 'bg-sky-50', text: 'text-sky-600', label: 'Remarcacao' },
  no_show: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Nao compareceu' },
}

export function Badge({ status }: { status: AppointmentStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide ${config.bg} ${config.text}`}>
      <span className="h-[7px] w-[7px] rounded-full bg-current" />
      {config.label}
    </span>
  )
}
